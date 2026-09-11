/**
 * Turns PNG masters in assets-in/ into the exact WebP files the page expects.
 *
 * Drop <group>/<name>.png into assets-in/ keeping the names from
 * docs/asset-prompts.md, then run `npm run assets:import`. Each file is fitted
 * to its export size without distortion (a mismatched aspect is padded, never
 * stretched) and written to public/images/<group>/<name>.webp at quality 90.
 *
 * Any asset whose target background is transparent and that arrives without an
 * alpha channel is cut out first. The five that must keep their ground —
 * features/rails on white and the four showcase assets on #000320 — are never
 * cut, because the size table gives them a real background colour.
 */
import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";
import { cutout } from "./cutout.mjs";

const IN = "assets-in";
const OUT = "public/images";
const T = "transparent";

/** Export size and background, transcribed from docs/asset-prompts.md. */
const SPEC = {
  /* Trial: one flat image for the whole desktop hero, kept at its native size. */
  "hero/header": [1798, 875, "#FFFFFF"],
  /* Trial: the last screen (CTA and footer) as one flat image, native size. */
  "solution/footer": [1798, 875, "#0A68F5"],
  /* Trial: the Solution screen as one flat image, native size. */
  "solution/solution": [1796, 876, "#0A68F5"],
  "hero/ribbon": [3840, 968, T],
  "hero/coin-tsla": [900, 900, T, { checker: true }],
  "hero/coin-nvda": [600, 600, T, { shadow: true }],
  "hero/coin-aapl": [500, 500, T],
  "hero/coin-meta": [900, 900, T],
  "hero/chip-up": [300, 250, T, { shadow: true }],
  "hero/chip-bell": [200, 200, T],
  "hero/chip-clock": [160, 160, T],
  "hero/chip-blank": [160, 160, T],
  "features/circle-blue": [300, 300, T],
  "features/circle-dark": [300, 300, T],
  "features/circle-lilac": [300, 300, T],
  "features/rails": [1100, 780, "#FFFFFF"],
  "features/tile-bell": [180, 180, T],
  "features/tile-down": [180, 180, T],
  "features/tile-pool": [180, 180, T],
  "features/tile-up": [180, 180, T],
  "features/sphere-dark": [260, 260, T],
  "solution/toggle": [700, 400, T, { shadow: true }],
  "solution/bell": [200, 200, T, { checker: true }],
  "solution/cursor": [200, 240, T],
  "solution/tray-coin": [700, 500, T, { checker: true }],
  "showcase/orb": [600, 600, "#000320"],
  /* Arrived with a painted checker: cut it, then lay the cards on the panel colour. */
  "showcase/stack": [1100, 900, "#000320", { checker: true, cut: true }],
  "showcase/icon-up": [180, 180, "#000320"],
  "showcase/receipts": [1300, 650, "#000320"],
};

const rgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
  alpha: 1,
});

if (!existsSync(IN)) {
  console.log(`${IN}/ does not exist yet — nothing to import.`);
  process.exit(0);
}

/* Optional keys on the command line limit the run, e.g. hero/coin-nvda. */
const ONLY = new Set(process.argv.slice(2));

const files = [];
for (const group of readdirSync(IN)) {
  const dir = join(IN, group);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (/\.(png|jpe?g|jfif|webp|tiff?|avif)$/i.test(f)) files.push([group, f]);
  }
}

let done = 0;
const unknown = [];
const warn = [];
for (const [group, file] of files) {
  const key = `${group}/${basename(file, extname(file))}`;
  if (ONLY.size && !ONLY.has(key)) continue;
  const spec = SPEC[key];
  if (!spec) {
    unknown.push(`${group}/${file}`);
    continue;
  }
  const [w, h, bg, opts = {}] = spec;
  mkdirSync(join(OUT, group), { recursive: true });
  const path = join(IN, group, file);
  const meta = await sharp(path).metadata();
  let source = path;
  let cut = "";
  let cleared = 0;
  if (bg === T || opts.cut) {
    /* JPEG (including the .jfif Windows hands out) rings around high-contrast
       edges, so the ground is never exactly one colour there; widen the band. */
    const lossy = meta.format === "jpeg";
    const r = await cutout(path, { ...(lossy ? { solid: 20, keep: 56 } : {}), ...opts });
    source = r.buffer;
    cleared = r.skipped ? 0 : r.clearedPct;
    cut = r.skipped ? "  (alpha already present)" : `  (cut out, ${cleared}% cleared, ground ${r.bg.join(",")})`;
  }
  let img = sharp(source);
  if (bg !== T) img = img.flatten({ background: rgb(bg) });
  await img
    .resize(w, h, {
      fit: "contain",
      background: bg === T ? { r: 0, g: 0, b: 0, alpha: 0 } : rgb(bg),
    })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(join(OUT, group, `${basename(file, extname(file))}.webp`));
  const ratioIn = (meta.width / meta.height).toFixed(3);
  const ratioOut = (w / h).toFixed(3);
  const note = ratioIn === ratioOut ? "" : `  (padded: source ${meta.width}x${meta.height})`;
  /* Two things that look fine in the log but ruin the asset on the page. */
  if (cleared > 0 && cleared < 12) warn.push(`${key}: cutout cleared only ${cleared}% — the ground did not separate from the object`);
  if (meta.width < w / 2) warn.push(`${key}: source is ${meta.width}px wide for a ${w}px export — upscaling cannot add detail`);
  console.log(`  ${key}.webp  ${w}x${h}${note}${cut}`);
  done += 1;
}

for (const f of unknown) console.log(`  skipped, unknown name: ${f}`);
if (warn.length) {
  console.log("\ncheck these:");
  for (const line of warn) console.log(`  ! ${line}`);
}

const missing = Object.keys(SPEC).filter((k) => !existsSync(join(OUT, `${k}.webp`)));
console.log(`\nimported ${done}, still missing ${missing.length}:`);
for (const m of missing) console.log(`  ${m}`);
