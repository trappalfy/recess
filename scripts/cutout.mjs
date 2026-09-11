/**
 * Knocks a flat, graded or checkerboard background out of a generated image.
 *
 * rembg needs Python, which this machine does not have, so the cutout runs
 * here: model the ground, flood fill against it, unmix the rim, drop specks.
 *
 * Ground models
 * - Graded (default). Generated grounds drift by 10 to 50 levels across the
 *   frame. The four frame edges are median-smoothed and blended into a Coons
 *   patch, a predicted ground colour for every pixel. The prediction never
 *   looks at the object, so it cannot creep into it the way a fill that adapts
 *   as it walks does: a glossy object's shading is itself a gentle gradient.
 * - Checker (`checker: true`). Some masters arrive with transparency painted in
 *   as a grey checkerboard. The two tones and the square size are read off the
 *   frame edge. A pixel is ground only when it matches one tone and the other
 *   tone sits one square away from it: that rhythm is what separates the light
 *   squares from a frosted white object of the same colour (tray-coin), which
 *   a colour test alone cannot. Enclosed patches (the gap in a bell's hanging
 *   loop) are seeded by the same test, and the one-pixel blends along square
 *   boundaries are cleared afterwards.
 *
 * The fill runs from the frame edges, so only ground connected to the border
 * goes; a global key would eat the pearl-white face of coin-meta. Between
 * `solid` and `keep` a pixel becomes partly transparent, and its colour is
 * unmixed from the ground behind it, so no halo survives onto the blue section.
 *
 * Cleanup: solid islands under 8% of the main object are dropped, and so are
 * partly transparent pixels with nothing solid within two pixels. Both are
 * leftover ground (specks, a haze from a blurred photo backdrop), never part of
 * a single-object asset.
 *
 * `shadow` treats a multiplicative darkening of the ground (a cast shadow) as
 * ground. Opt-in only: a neutral dark object on a neutral ground (sphere-dark)
 * looks exactly like a shadow to this test.
 */
import sharp from "sharp";

/** Sliding median, then a box average: kills noise and object specks alike. */
function smoothEdge(values, win) {
  const n = values.length;
  const med = new Float32Array(n);
  const half = win >> 1;
  const buf = [];
  for (let i = 0; i < n; i++) {
    buf.length = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(n - 1, i + half); j++) buf.push(values[j]);
    buf.sort((a, b) => a - b);
    med[i] = buf[buf.length >> 1];
  }
  const out = new Float32Array(n);
  let acc = 0;
  const q = [];
  for (let i = 0; i < n; i++) {
    q.push(med[i]);
    acc += med[i];
    if (q.length > win) acc -= q.shift();
    out[i] = acc / q.length;
  }
  return out;
}

function borderIndices(w, h) {
  const out = [];
  for (let x = 0; x < w; x++) out.push(x, (h - 1) * w + x);
  for (let y = 1; y < h - 1; y++) out.push(y * w, y * w + w - 1);
  return out;
}

function coonsGround(px, w, h) {
  const edge = (len, at) => [0, 1, 2].map((c) => {
    const v = new Float32Array(len);
    for (let i = 0; i < len; i++) v[i] = px[at(i) * 4 + c];
    return smoothEdge(v, Math.max(9, Math.round(len * 0.04) | 1));
  });
  const T = edge(w, (x) => x);
  const B = edge(w, (x) => (h - 1) * w + x);
  const L = edge(h, (y) => y * w);
  const R = edge(h, (y) => y * w + w - 1);
  const model = new Float32Array(w * h * 3);
  for (let c = 0; c < 3; c++) {
    const c00 = (T[c][0] + L[c][0]) / 2;
    const c10 = (T[c][w - 1] + R[c][0]) / 2;
    const c01 = (B[c][0] + L[c][h - 1]) / 2;
    const c11 = (B[c][w - 1] + R[c][h - 1]) / 2;
    for (let y = 0; y < h; y++) {
      const v = h > 1 ? y / (h - 1) : 0;
      for (let x = 0; x < w; x++) {
        const u = w > 1 ? x / (w - 1) : 0;
        model[(y * w + x) * 3 + c] =
          (1 - v) * T[c][x] + v * B[c][x] + (1 - u) * L[c][y] + u * R[c][y] -
          ((1 - u) * (1 - v) * c00 + u * (1 - v) * c10 + (1 - u) * v * c01 + u * v * c11);
      }
    }
  }
  return (p, out) => {
    const m = p * 3;
    out[0] = model[m];
    out[1] = model[m + 1];
    out[2] = model[m + 2];
  };
}

/** Two-means on the frame edge: the light and dark squares of the checker. */
function checkerTones(px, w, h) {
  const idx = borderIndices(w, h);
  const lum = (p) => px[p * 4] + px[p * 4 + 1] + px[p * 4 + 2];
  let lo = idx[0];
  let hi = idx[0];
  for (const p of idx) {
    if (lum(p) < lum(lo)) lo = p;
    if (lum(p) > lum(hi)) hi = p;
  }
  let A = [px[lo * 4], px[lo * 4 + 1], px[lo * 4 + 2]];
  let B = [px[hi * 4], px[hi * 4 + 1], px[hi * 4 + 2]];
  for (let it = 0; it < 8; it++) {
    const sa = [0, 0, 0];
    const sb = [0, 0, 0];
    let na = 0;
    let nb = 0;
    for (const p of idx) {
      const i = p * 4;
      const da = Math.abs(px[i] - A[0]) + Math.abs(px[i + 1] - A[1]) + Math.abs(px[i + 2] - A[2]);
      const db = Math.abs(px[i] - B[0]) + Math.abs(px[i + 1] - B[1]) + Math.abs(px[i + 2] - B[2]);
      const s = da <= db ? sa : sb;
      s[0] += px[i];
      s[1] += px[i + 1];
      s[2] += px[i + 2];
      if (da <= db) na++;
      else nb++;
    }
    if (na) A = sa.map((v) => v / na);
    if (nb) B = sb.map((v) => v / nb);
  }
  return [A, B];
}

/** Median run of one tone along the top edge: the checker square size. */
function checkerSize(px, w, A, B) {
  const runs = [];
  let prev = -1;
  let len = 0;
  for (let x = 0; x < w; x++) {
    const i = x * 4;
    const da = Math.abs(px[i] - A[0]) + Math.abs(px[i + 1] - A[1]) + Math.abs(px[i + 2] - A[2]);
    const db = Math.abs(px[i] - B[0]) + Math.abs(px[i + 1] - B[1]) + Math.abs(px[i + 2] - B[2]);
    const t = da <= db ? 0 : 1;
    if (t === prev) len++;
    else {
      if (len >= 2) runs.push(len);
      prev = t;
      len = 1;
    }
  }
  runs.sort((a, b) => a - b);
  return runs.length ? runs[runs.length >> 1] : 16;
}

export async function cutout(input, { solid = 12, keep = 42, shadow = false, checker = false, islands = true } = {}) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = Buffer.from(data);
  const n = w * h;

  for (let i = 3; i < px.length; i += 4) {
    if (px[i] < 250) return { buffer: input, info, skipped: "already has alpha" };
  }

  const dist = (i, T) => Math.max(Math.abs(px[i] - T[0]), Math.abs(px[i + 1] - T[1]), Math.abs(px[i + 2] - T[2]));
  const g = [0, 0, 0];
  let groundAt;
  let classify;
  let tones = null;

  if (checker) {
    const [A, B] = checkerTones(px, w, h);
    const s = checkerSize(px, w, A, B);
    tones = { A, B, size: s };
    if (checker === "segment") {
      /* Ground is the nearest point on the colour segment A-B, so the square
         boundaries, which blend the two tones, count as ground too. Looser
         than the rhythm test, and kinder to translucent glass that shows the
         squares through itself: that glass comes out see-through, not blocky. */
      const D = [B[0] - A[0], B[1] - A[1], B[2] - A[2]];
      const DD = Math.max(1, D[0] * D[0] + D[1] * D[1] + D[2] * D[2]);
      groundAt = (p, out) => {
        const i = p * 4;
        let t = ((px[i] - A[0]) * D[0] + (px[i + 1] - A[1]) * D[1] + (px[i + 2] - A[2]) * D[2]) / DD;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        out[0] = A[0] + t * D[0];
        out[1] = A[1] + t * D[1];
        out[2] = A[2] + t * D[2];
      };
      classify = (p) => {
        groundAt(p, g);
        const d = dist(p * 4, g);
        if (d <= solid) return 0;
        if (d >= keep) return 255;
        return Math.round(((d - solid) / (keep - solid)) * 255);
      };
    } else {
    groundAt = (p, out) => {
      const i = p * 4;
      const T = dist(i, A) <= dist(i, B) ? A : B;
      out[0] = T[0];
      out[1] = T[1];
      out[2] = T[2];
    };
    /* One square away in any direction, allowing a pixel of slack either way. */
    const offsets = [s - 1, s, s + 1];
    const rhythm = (p, O) => {
      const x = p % w;
      const y = (p / w) | 0;
      for (const o of offsets) {
        if (x + o < w && dist((p + o) * 4, O) <= solid * 1.5) return true;
        if (x - o >= 0 && dist((p - o) * 4, O) <= solid * 1.5) return true;
        if (y + o < h && dist((p + o * w) * 4, O) <= solid * 1.5) return true;
        if (y - o >= 0 && dist((p - o * w) * 4, O) <= solid * 1.5) return true;
      }
      return false;
    };
    classify = (p) => {
      const i = p * 4;
      const da = dist(i, A);
      const db = dist(i, B);
      const d = Math.min(da, db);
      if (d <= solid) return rhythm(p, da <= db ? B : A) ? 0 : 255;
      if (d >= keep) return 255;
      return Math.round(((d - solid) / (keep - solid)) * 255);
    };
    }
  } else {
    groundAt = coonsGround(px, w, h);
    classify = (p) => {
      const i = p * 4;
      groundAt(p, g);
      const r = px[i];
      const gg = px[i + 1];
      const b = px[i + 2];
      let d = Math.max(Math.abs(r - g[0]), Math.abs(gg - g[1]), Math.abs(b - g[2]));
      if (shadow && d > solid) {
        const k = (r + gg + b) / Math.max(1, g[0] + g[1] + g[2]);
        /* A cast shadow on a light ground never goes near black; that deep a
           darkening is the object itself, such as the dark reeding of a coin. */
        if (k < 1 && k >= 0.3) {
          const ds = Math.max(Math.abs(r - k * g[0]), Math.abs(gg - k * g[1]), Math.abs(b - k * g[2]));
          if (ds < d) d = ds;
        }
      }
      if (d <= solid) return 0;
      if (d >= keep) return 255;
      return Math.round(((d - solid) / (keep - solid)) * 255);
    };
  }

  const alpha = new Uint8Array(n).fill(255);
  const seen = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const visit = (p) => {
    if (seen[p]) return;
    seen[p] = 1;
    const a = classify(p);
    if (a === 255) return;
    alpha[p] = a;
    queue[tail++] = p;
  };
  for (const p of borderIndices(w, h)) visit(p);

  /* Enclosed checker patches pass the same rhythm test, so seed them too. */
  if (tones) {
    for (let y = 0; y < h; y += 2) {
      for (let x = 0; x < w; x += 2) {
        const p = y * w + x;
        if (!seen[p] && classify(p) === 0) visit(p);
      }
    }
  }

  while (head < tail) {
    const p = queue[head++];
    /* A rim pixel is the boundary; spreading past it would climb the object. */
    if (alpha[p] > 128) continue;
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) visit(p - 1);
    if (x < w - 1) visit(p + 1);
    if (y > 0) visit(p - w);
    if (y < h - 1) visit(p + w);
  }

  /* Square boundaries blend the two tones into a one-pixel line of partial
     alpha; with ground on both sides of it, it is ground. */
  if (tones) {
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const p = y * w + x;
          const a = alpha[p];
          if (a === 0 || a === 255) continue;
          if ((alpha[p - 1] === 0 && alpha[p + 1] === 0) || (alpha[p - w] === 0 && alpha[p + w] === 0)) alpha[p] = 0;
        }
      }
    }
  }

  if (islands) {
    const label = new Int32Array(n).fill(-1);
    const sizes = [];
    const stack = new Int32Array(n);
    for (let p0 = 0; p0 < n; p0++) {
      if (alpha[p0] <= 128 || label[p0] !== -1) continue;
      const id = sizes.length;
      let sp = 0;
      let size = 0;
      stack[sp++] = p0;
      label[p0] = id;
      while (sp) {
        const p = stack[--sp];
        size++;
        const x = p % w;
        const left = x > 0 ? p - 1 : -1;
        const right = x < w - 1 ? p + 1 : -1;
        for (const q of [left, right, p - w, p + w]) {
          if (q < 0 || q >= n || alpha[q] <= 128 || label[q] !== -1) continue;
          label[q] = id;
          stack[sp++] = q;
        }
      }
      sizes.push(size);
    }
    let biggest = 0;
    for (const s of sizes) if (s > biggest) biggest = s;
    for (let p = 0; p < n; p++) {
      if (label[p] >= 0 && sizes[label[p]] < biggest * 0.08) alpha[p] = 0;
    }
    /* Haze: partial pixels with nothing solid within two pixels. */
    const drop = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        const a = alpha[p];
        if (a === 0 || a > 128) continue;
        let anchored = false;
        for (let dy = -2; dy <= 2 && !anchored; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            if (alpha[yy * w + xx] > 128) {
              anchored = true;
              break;
            }
          }
        }
        if (!anchored) drop.push(p);
      }
    }
    for (const p of drop) alpha[p] = 0;
  }

  let cleared = 0;
  for (let p = 0; p < n; p++) {
    const a = alpha[p];
    if (a === 255) continue;
    if (a === 0) cleared++;
    const i = p * 4;
    if (a > 0) {
      groundAt(p, g);
      const f = a / 255;
      for (let c = 0; c < 3; c++) {
        px[i + c] = Math.min(255, Math.max(0, Math.round((px[i + c] - (1 - f) * g[c]) / f)));
      }
    }
    px[i + 3] = a;
  }

  groundAt(0, g);
  return {
    buffer: await sharp(px, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer(),
    info,
    bg: tones
      ? [...tones.A.map(Math.round), "/", ...tones.B.map(Math.round), `sq${tones.size}`]
      : g.map(Math.round),
    clearedPct: Math.round((cleared / n) * 100),
  };
}
