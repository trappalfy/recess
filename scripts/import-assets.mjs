/**
 * Turns PNG masters in assets-in/ into the exact WebP files the page expects.
 *
 * Drop <group>/<name>.png into assets-in/ keeping the names from
 * docs/asset-prompts.md, then run `npm run assets:import`. Each file is fitted
 * to its export size without distortion (a mismatched aspect is padded, never
 * stretched) and written to public/images/<group>/<name>.webp at quality 90.
 */
import { readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const IN = "assets-in";
const OUT = "public/images";
const T = "transparent";

/** Export size and background, transcribed from docs/asset-prompts.md. */
const SPEC = {
  "hero/ribbon": [3840, 968, T],
  "hero/coin-tsla": [900, 900, T],
  "hero/coin-nvda": [600, 600, T],
  "hero/coin-aapl": [500, 500, T],
  "hero/coin-meta": [900, 900, T],
  "hero/chip-up": [300, 250, T],
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
  "solution/toggle": [700, 400, T],
  "solution/bell": [200, 200, T],
  "solution/cursor": [200, 240, T],
  "solution/tray-coin": [700, 500, T],
  "showcase/orb": [600, 600, "#000320"],
  "showcase/stack": [1100, 900, "#000320"],
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

const files = [];
for (const group of readdirSync(IN)) {
  const dir = join(IN, group);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir)) {
    if (/\.(png|jpe?g|webp|tiff?)$/i.test(f)) files.push([group, f]);
  }
}

let done = 0;
const unknown = [];
for (const [group, file] of files) {
  const key = `${group}/${basename(file, extname(file))}`;
  const spec = SPEC[key];
  if (!spec) {
    unknown.push(`${group}/${file}`);
    continue;
  }
  const [w, h, bg] = spec;
  mkdirSync(join(OUT, group), { recursive: true });
  const meta = await sharp(join(IN, group, file)).metadata();
  await sharp(join(IN, group, file))
    .resize(w, h, {
      fit: "contain",
      background: bg === T ? { r: 0, g: 0, b: 0, alpha: 0 } : rgb(bg),
    })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(join(OUT, group, `${basename(file, extname(file))}.webp`));
  const ratioIn = (meta.width / meta.height).toFixed(3);
  const ratioOut = (w / h).toFixed(3);
  const note = ratioIn === ratioOut ? "" : `  (padded: source ${meta.width}x${meta.height})`;
  console.log(`  ${key}.webp  ${w}x${h}${note}`);
  done += 1;
}

for (const f of unknown) console.log(`  skipped, unknown name: ${f}`);

const missing = Object.keys(SPEC).filter((k) => !existsSync(join(OUT, `${k}.webp`)));
console.log(`\nimported ${done}, still missing ${missing.length}:`);
for (const m of missing) console.log(`  ${m}`);
