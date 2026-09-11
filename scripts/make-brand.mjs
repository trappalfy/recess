/**
 * Builds every brand file from the owner's logo master, recess-logo.png:
 *
 * - public/brand/mark.webp: the mark alone, cut out of its blue tile and
 *   trimmed to its edges. <Mark/> renders it, so every place that shows the
 *   mark changes with this one file (main brief 5).
 * - app/icon.png: the whole tile with rounded corners, the site favicon.
 * - app/apple-icon.png: the whole tile, square and opaque, for the iOS home
 *   screen, which applies its own rounding.
 *
 * The mark is a lit 3D render, so it stays an image (main brief 1); it cannot
 * be redrawn as a vector. Run `npm run brand` after replacing the master.
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";
import { cutout } from "./cutout.mjs";

const SRC = "recess-logo.png";
const MARK_HEIGHT = 256;

mkdirSync("public/brand", { recursive: true });

/* The mark sits on a blue tile: its drop shadow is a darker blue (shadow mode
   takes it as ground), its four windows are enclosed ground (holes), and the
   shard at its upper left is a separate island of about 3% of the mark, which
   the default 8% speck cleanup would delete. */
const cut = await cutout(SRC, { shadow: true, holes: true, solid: 16, keep: 56, islandShare: 0.01 });
const trimmed = await sharp(cut.buffer).trim({ threshold: 1 }).png().toBuffer();
const mark = await sharp(trimmed)
  .resize({ height: MARK_HEIGHT })
  .webp({ quality: 92, alphaQuality: 100, effort: 6 })
  .toFile("public/brand/mark.webp");

const radius = Math.round(512 * 0.225);
const roundMask = Buffer.from(
  `<svg width="512" height="512"><rect width="512" height="512" rx="${radius}" ry="${radius}"/></svg>`,
);
await sharp(SRC)
  .resize(512, 512)
  .composite([{ input: roundMask, blend: "dest-in" }])
  .png()
  .toFile("app/icon.png");
await sharp(SRC).resize(180, 180).flatten({ background: "#1050F0" }).png().toFile("app/apple-icon.png");

console.log(`cutout: ${cut.clearedPct}% cleared, ground ${cut.bg.join(",")}`);
console.log(`mark: ${mark.width}x${mark.height}, aspect ${(mark.width / mark.height).toFixed(4)}`);
console.log("icon: app/icon.png 512x512 rounded, app/apple-icon.png 180x180");
