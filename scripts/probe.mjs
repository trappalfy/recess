import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const W = 1905, H = 927;
const which = process.argv[2] ?? "features";
const isLocal = which.endsWith(".png");
const file = isLocal ? which : resolve("reference", which + ".webp");
const mime = isLocal ? "png" : "webp";
const b64 = readFileSync(file).toString("base64");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent('<img id="i" src="data:image/' + mime + ';base64,' + b64 + '">');
await page.waitForFunction(() => document.getElementById("i")?.complete);

const out = await page.evaluate((W2) => {
  const H2 = 927;
  const img = document.getElementById("i");
  const c = document.createElement("canvas");
  c.width = W2; c.height = H2;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, W2, H2);
  const d = ctx.getImageData(0, 0, W2, H2).data;

  const lum = (x, y) => {
    const i = (y * W2 + x) * 4;
    return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  };

  const rows = [];
  for (let y = 0; y < 200; y++) {
    let dark = 0;
    for (let x = 400; x < 1500; x += 2) if (lum(x, y) < 100) dark++;
    rows.push({ y, dark });
  }
  const hits = rows.filter((r) => r.dark > 3);
  const headingTop = hits.length ? hits[0].y : null;
  const headingBottom = hits.length ? hits[hits.length - 1].y : null;

  let cardTop = null;
  for (let y = 140; y < 320; y++) {
    let border = 0;
    for (let x = 500; x < 900; x += 2) if (lum(x, y) < 246) border++;
    if (border > 150) { cardTop = y; break; }
  }

  const probeY = (cardTop ?? 200) + 120;
  const edges = [];
  for (let x = 1; x < W2 - 1; x++) {
    if (lum(x, probeY) < 246 && lum(x - 1, probeY) >= 246) edges.push(x);
  }

  return { headingTop, headingBottom, cardTop, probeY, firstEdges: edges.slice(0, 6) };
}, W);

console.log(which, JSON.stringify(out));
await browser.close();
