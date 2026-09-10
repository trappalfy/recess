/**
 * Knocks a flat background out of a generated image.
 *
 * rembg needs Python, which this machine does not have, so the cutout is done
 * here: a flood fill from the frame edges, which only removes background that
 * is actually connected to the border. That distinction matters — a global
 * colour key would eat the pearl-white face of coin-meta, and this does not.
 *
 * Two thresholds give the edge its antialiasing back: below `solid` a pixel is
 * pure background, above `keep` it is pure object, and in between it becomes
 * partly transparent. Those in-between pixels are then unmixed from the
 * background colour, which is what stops the white halo showing up once the
 * asset is placed on the blue section.
 */
import sharp from "sharp";

const dist = (r, g, b, bg) =>
  Math.max(Math.abs(r - bg[0]), Math.abs(g - bg[1]), Math.abs(b - bg[2]));

/** Median of the four corners, so one stray pixel cannot pick the colour. */
function sampleBackground(px, w, h) {
  const at = (x, y) => {
    const i = (y * w + x) * 4;
    return [px[i], px[i + 1], px[i + 2]];
  };
  const corners = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)];
  return [0, 1, 2].map((c) => {
    const v = corners.map((k) => k[c]).sort((a, b) => a - b);
    return Math.round((v[1] + v[2]) / 2);
  });
}

export async function cutout(input, { solid = 14, keep = 64, background } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = Buffer.from(data);

  const alreadyCut = (() => {
    for (let i = 3; i < px.length; i += 4) if (px[i] < 250) return true;
    return false;
  })();
  if (alreadyCut) return { buffer: input, info, skipped: "already has alpha" };

  const bg = background ?? sampleBackground(px, w, h);
  const alpha = new Uint8Array(w * h).fill(255);
  const seen = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const push = (p) => {
    if (seen[p]) return;
    const i = p * 4;
    const d = dist(px[i], px[i + 1], px[i + 2], bg);
    if (d >= keep) return;
    seen[p] = 1;
    alpha[p] = d <= solid ? 0 : Math.round(((d - solid) / (keep - solid)) * 255);
    queue[tail++] = p;
  };

  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }

  while (head < tail) {
    const p = queue[head++];
    /* Only fully transparent pixels spread; the soft band is the boundary and
       must not let the fill leak through a highlight into the object. */
    if (alpha[p] !== 0) continue;
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }

  let cleared = 0;
  for (let p = 0; p < w * h; p++) {
    const a = alpha[p];
    if (a === 255) continue;
    if (a === 0) cleared++;
    const i = p * 4;
    if (a > 0) {
      /* Unmix: the pixel is object over background, so recover the object. */
      const f = a / 255;
      for (let c = 0; c < 3; c++) {
        px[i + c] = Math.min(255, Math.max(0, Math.round((px[i + c] - (1 - f) * bg[c]) / f)));
      }
    }
    px[i + 3] = a;
  }

  return {
    buffer: await sharp(px, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer(),
    info,
    bg,
    clearedPct: Math.round((cleared / (w * h)) * 100),
  };
}
