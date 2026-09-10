import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const W = 1905, H = 927;
const OUT = "artifacts";
mkdirSync(OUT, { recursive: true });

/** Main brief 12.1 scroll positions. */
const SHOTS = [
  { name: "hero", scroll: () => window.scrollTo(0, 0) },
  {
    name: "features",
    scroll: () => {
      const el = document.querySelector('[data-testid="features-h2"]');
      if (!el) throw new Error("features heading not found");
      window.scrollBy(0, el.getBoundingClientRect().top - 17);
    },
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

const captured = [];
for (const shot of SHOTS) {
  try {
    await page.evaluate(shot.scroll);
  } catch (err) {
    console.warn(`skipping ${shot.name}: ${err.message}`);
    continue;
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: resolve(OUT, `shot-${shot.name}.png`) });
  captured.push(shot.name);
  console.log(`captured ${shot.name}`);
}

const overlay = await browser.newPage({ viewport: { width: W, height: H } });
for (const name of captured) {
  let shotB64, refB64;
  try {
    shotB64 = readFileSync(resolve(OUT, `shot-${name}.png`)).toString("base64");
    refB64 = readFileSync(resolve("reference", `${name}.webp`)).toString("base64");
  } catch {
    continue;
  }
  await overlay.setContent(`
    <style>
      html,body{margin:0;width:${W}px;height:${H}px;background:#fff}
      img{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:fill}
      #ref{opacity:.5}
    </style>
    <img id="shot" src="data:image/png;base64,${shotB64}">
    <img id="ref" src="data:image/webp;base64,${refB64}">
  `);
  await overlay.waitForTimeout(400);
  await overlay.screenshot({ path: resolve(OUT, `overlay-${name}.png`) });
  console.log(`overlay ${name}`);
}

await browser.close();
console.log(`\nWrote ${OUT}/shot-*.png and ${OUT}/overlay-*.png`);
