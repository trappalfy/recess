import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const W = 1905, H = 927;
const OUT = "artifacts";
mkdirSync(OUT, { recursive: true });

/**
 * Main brief 12.1 scroll positions.
 *
 * `inkTop` means the shot is aligned on the first row of dark pixels in the
 * heading, which is how the reference was measured. Font metrics alone are not
 * accurate enough here, so the shot is taken, measured, nudged and retaken.
 */
const SHOTS = [
  { name: "hero", scroll: () => window.scrollTo(0, 0) },
  {
    name: "features",
    scroll: () => {
      const el = document.querySelector('[data-testid="features-h2"]');
      if (!el) throw new Error("features heading not found");
      window.scrollBy(0, el.getBoundingClientRect().top - 17);
    },
    inkTop: 17,
  },
  {
    name: "solution",
    scroll: () => {
      const el = document.querySelector('[data-testid="blue-section"]');
      if (!el) throw new Error("blue section not found");
      window.scrollBy(0, el.getBoundingClientRect().top);
    },
  },
  {
    name: "cta",
    scroll: () => {
      const el = document.querySelector('[data-testid="showcase-card"]');
      if (!el) throw new Error("showcase card not found");
      window.scrollBy(0, el.getBoundingClientRect().bottom - 80);
    },
  },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", (e) => console.warn("page error:", e.message));
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

/** A scratch page used to read pixels out of a PNG buffer. */
const scan = await browser.newPage({ viewport: { width: W, height: H } });

async function inkTop(buffer) {
  const b64 = buffer.toString("base64");
  await scan.setContent(`<img id="i" src="data:image/png;base64,${b64}">`);
  await scan.waitForFunction(() => document.getElementById("i")?.complete);
  return scan.evaluate((width) => {
    const img = document.getElementById("i");
    const c = document.createElement("canvas");
    c.width = width; c.height = 200;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, width, 200).data;
    for (let y = 0; y < 200; y++) {
      let dark = 0;
      for (let x = 400; x < 1500; x += 2) {
        const i = (y * width + x) * 4;
        if (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] < 100) dark++;
      }
      if (dark > 3) return y;
    }
    return null;
  }, W);
}

const captured = [];
for (const shot of SHOTS) {
  try {
    await page.evaluate(shot.scroll);
  } catch (err) {
    console.warn(`skipping ${shot.name}: ${err.message.split("\n")[0]}`);
    continue;
  }
  await page.waitForTimeout(1800);
  let buffer = await page.screenshot();

  if (shot.inkTop != null) {
    const seen = await inkTop(buffer);
    if (seen != null && seen !== shot.inkTop) {
      await page.evaluate((dy) => window.scrollBy(0, dy), seen - shot.inkTop);
      await page.waitForTimeout(400);
      buffer = await page.screenshot();
      const after = await inkTop(buffer);
      console.log(`  ${shot.name}: ink top ${seen} -> ${after}, target ${shot.inkTop}`);
    }
  }

  writeFileSync(resolve(OUT, `shot-${shot.name}.png`), buffer);
  captured.push(shot.name);
  console.log(`captured ${shot.name}`);
}

for (const name of captured) {
  let shotB64, refB64;
  try {
    shotB64 = readFileSync(resolve(OUT, `shot-${name}.png`)).toString("base64");
    refB64 = readFileSync(resolve("reference", `${name}.webp`)).toString("base64");
  } catch {
    continue;
  }
  await scan.setContent(`
    <style>
      html,body{margin:0;width:${W}px;height:${H}px;background:#fff}
      img{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:fill}
      #ref{opacity:.5}
    </style>
    <img id="shot" src="data:image/png;base64,${shotB64}">
    <img id="ref" src="data:image/webp;base64,${refB64}">
  `);
  await scan.waitForTimeout(400);
  await scan.screenshot({ path: resolve(OUT, `overlay-${name}.png`) });
  console.log(`overlay ${name}`);
}

await browser.close();
console.log(`\nWrote ${OUT}/shot-*.png and ${OUT}/overlay-*.png`);
