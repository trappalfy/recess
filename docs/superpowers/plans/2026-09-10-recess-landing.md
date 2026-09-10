# Recess Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Recess landing page as a pixel-faithful reconstruction of the reference composition, with Recess copy, own generated imagery, a live epoch countdown, and a wallet-aware entry pill that leads into the trading app.

**Architecture:** A Next.js App Router project whose landing route is one page composed of six section components. Hero and the blue section are proportional artboards: a CSS container query defines `--u: calc(100cqw / 1905)` and every coordinate from the spec is authored as `calc(N * var(--u))`, so the whole composition scales as one unit instead of reflowing. Every 3D object is an image slot; until real art exists each slot renders an exact-size placeholder, and a generated manifest flips slots to `next/image` automatically as files appear in `public/images`. Wallet state is global from the root layout, so the landing can connect a wallet. There is no backend of any kind.

**Tech Stack:** Next.js 16.3.4 (App Router) · React 19.3.0 · TypeScript · Tailwind CSS 4.3.3 · motion 13.2.0 · lucide-react 1.44.0 · wagmi + viem + RainbowKit · next/font/google · Vitest 5.0.0 (unit) · Playwright 1.63.0 (layout + acceptance)

**Spec:** `recess-site-brief.md` plus `recess-brief-update-01.md`. The corrective brief takes priority wherever the two disagree. Executors read both alongside this plan; section numbers below say which document they refer to.

**Companion plan:** `docs/superpowers/plans/2026-09-10-recess-app.md` builds the trading app at `/app`. This plan stops at the landing and the shared foundations the app also needs.

## Global Constraints

- **No backend (update §preamble).** Do not create smart contracts, `.sol` files, Hardhat, Foundry, deploy scripts, API routes under `app/api`, data-writing server actions, databases, ORMs, migrations, indexers, subgraphs, crons, workers, queues, server sessions, or RPC and price proxies. If a task looks impossible without a backend, stop and ask instead of building one.
- **Waitlist is gone (update §1).** No `WaitlistForm`, no `app/api/waitlist`, no email handling, no `localStorage` waitlist state, no provider adapters. Main brief §10 is void, and its acceptance checks in §12 drop with it.
- **Copy rules (main §1).** No yield promises, no APY / earn / profit. No invented numbers: real verifiable figures or none. No implied connection to Robinhood Markets, no Robinhood logo, no Robinhood green. No company logos anywhere, tickers as plain text only. Never the words first, only, guaranteed. Never reuse reference wording.
- **Graphics rule (main §2).** Anything with volume, light, material or complex form is an image. Never draw those in CSS, SVG, canvas or WebGL. Code draws only flat things: cards, borders, lines, arcs, orbits, dots, strokes, skeleton board, buttons, the entry pill, badges, progress bars, the glowing pill in slide 3, the CTA app icon.
- **Reference hygiene (main §12.6).** No reference text, logo or image ships. `reference/` is never imported by application code.
- **Colours (main §4.1), exact values.** `ink #010320` · `body #66676C` · `blue #0A68F5` · `hero-blue #1269EA` · `line #E2E8F0` · `line-soft #E9EDF3` · `panel #000320` · `white #FFFFFF` · `teal-top #26FADE` · `teal-bottom #0EE8CC` · `on-blue-80 rgba(255,255,255,.80)` · `glass-40 rgba(255,255,255,.40)` · `glass-8 rgba(255,255,255,.08)`. Side colours from update §7: Above is `#0EE8CC`, Below is `#A48CFE`.
- **Type (main §4.2).** Headings Plus Jakarta Sans 500. Body Inter 400. Heading case is Title Case. H1 102px/1/−0.0075em. Section H2 64px/1.1. Card 1 H3 76.8px/1. Blue H2 56px/1.2. Numbers use `font-variant-numeric: tabular-nums` (update §7).
- **Grid (main §4.3).** Container `max-width: 1310px`, centred, 24px side gutters on narrow screens.
- **Easing (main §4.6).** `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` · `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`. Entrances 0.6–0.9s, hovers 0.2s.
- **Reduced motion (main §7).** Under `prefers-reduced-motion: reduce` there is no blur, no translation and no infinite loop. Only opacity 0→1 over 0.2s, and the slider does not auto-advance.
- **Network config (update §preamble, §5).** Mainnet Robinhood Chain by default. Chain id, RPC, explorer and the USDG address come from env only, never hardcoded. No testnet faucets and no testnet banners in the interface.
- **Mode flag (update §6).** `NEXT_PUBLIC_RECESS_MODE=mock|chain`, defaulting to `mock` when contract addresses are absent.
- **Reference resolution caveat.** The supplied screenshots are 1568×763, a uniform 1.215× downscale of the 1905×927 the spec assumes. All spec coordinates remain valid; the overlay harness upscales the references in-browser, so overlay tolerance is softer than ±4px until full-size captures are supplied.
- **Asset reality.** No image generator is available in this environment. All 26 assets ship as exact-size placeholders. Task 19 delivers the prompts so the images can be generated externally and dropped in without touching layout.

---

## File Structure

| Path | Responsibility |
|---|---|
| `app/layout.tsx` | Fonts, metadata, providers, html/body shell |
| `app/providers.tsx` | wagmi, react-query and RainbowKit providers, client-only |
| `app/page.tsx` | Landing section composition only |
| `app/globals.css` | Tailwind import, `@theme` tokens, artboard and grain utilities |
| `app/icon.svg` | Favicon: white mark on a blue tile |
| `app/terms/page.tsx`, `app/risk/page.tsx` | Legal stubs (update §8) |
| `lib/tokens.ts` | Colour, radius, shadow and easing constants shared by TS and tests |
| `lib/copy.ts` | Every user-facing string, one export per slot |
| `lib/u.ts` | `u(px)` helper returning `calc(N * var(--u))` |
| `lib/recess/schedule.ts` | Epoch clock: New York wall time, epoch boundaries, countdown format |
| `lib/recess/config.ts` | `feeBps`, `voidAfterHours`, tickers, minimum stake, env reads |
| `lib/wallet/chain.ts` | Robinhood Chain definition built from env |
| `lib/wallet/config.ts` | wagmi config and connectors |
| `lib/asset-manifest.ts` | **Generated.** Set of asset paths present on disk |
| `components/ui/Mark.tsx` | The temporary mark, single source of truth |
| `components/ui/Wordmark.tsx` | `recess` wordmark |
| `components/ui/Lockup.tsx` | Mark plus wordmark, header lockup |
| `components/ui/Asset.tsx` | Image-or-placeholder slot |
| `components/ui/AssetBox.tsx` | Absolutely positioned artboard slot in `--u` units |
| `components/ui/Badge.tsx` | Light badge and glass badge |
| `components/ui/LaunchPill.tsx` | 460×59 entry pill: countdown plus wallet-aware action |
| `components/ui/BlurWords.tsx` | Per-word blur-in heading |
| `components/ui/Reveal.tsx` | Opacity, y and blur entrance with staggered children |
| `components/ui/Float.tsx` | Infinite sine idle loop |
| `components/sections/Hero.tsx` | Hero artboard |
| `components/sections/HeroDecor.tsx` | Hero dots and hairline strokes |
| `components/sections/Features.tsx` | White bento section shell |
| `components/sections/BlueSection.tsx` | The single blue block wrapping the lower page |
| `components/sections/Solution.tsx` | Blue section head |
| `components/sections/Showcase.tsx` | Slider card shell |
| `components/sections/Cta.tsx` | CTA block |
| `components/sections/Footer.tsx` | Copyright, disclaimer, legal links, socials |
| `components/features/Card1.tsx` … `Card4.tsx` | The four bento cards |
| `components/features/CircleCarousel.tsx` | Card 1 rotating discs |
| `components/features/RailTiles.tsx` | Card 2 tiles on rails |
| `components/features/OrbitDots.tsx` | Card 3 orbits and dots |
| `components/features/SkeletonBoard.tsx` | Card 4 blurred board |
| `components/showcase/FeatureSlider.tsx` | Group list, dark panel, autoplay, progress |
| `components/showcase/SlideSide.tsx`, `SlidePool.tsx`, `SlideSettle.tsx` | The three slides |
| `scripts/make-grain.mjs` | Writes `public/textures/grain.png` |
| `scripts/scan-assets.mjs` | Regenerates `lib/asset-manifest.ts` |
| `scripts/acceptance.mjs` | Playwright captures plus 50% overlays |
| `tests/unit/*.test.ts` | Vitest |
| `tests/e2e/*.spec.ts` | Playwright geometry |
| `docs/asset-prompts.md` | The 26 generation prompts |

---

### Task 1: Scaffold, tokens, fonts, grain, asset pipeline

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `lib/tokens.ts`, `lib/u.ts`, `lib/asset-manifest.ts`, `scripts/make-grain.mjs`, `scripts/scan-assets.mjs`, `vitest.config.ts`, `playwright.config.ts`, `tests/unit/tokens.test.ts`
- Modify: `reference/` (rename the four screenshots)

**Interfaces:**
- Consumes: nothing.
- Produces: `TOKENS` from `lib/tokens.ts` with keys `ink, body, blue, heroBlue, line, lineSoft, panel, white, tealTop, tealBottom, above, below, onBlue80, glass40, glass8, easeOut, easeInOut`; `u(px: number): string`; `AVAILABLE: Set<string>`; npm scripts `dev`, `build`, `test`, `test:e2e`, `assets`, `grain`, `accept`.

- [ ] **Step 1: Initialise the repository and scaffold**

```bash
cd "C:/Users/chaiz/Desktop/Recess"
git init
npm init -y
npm i next@16.3.4 react@19.3.0 react-dom@19.3.0 motion@13.2.0 lucide-react@1.44.0
npm i -D typescript @types/node @types/react @types/react-dom tailwindcss@4.3.3 @tailwindcss/postcss vitest@5.0.0 @playwright/test@1.63.0
npx playwright install chromium
```

- [ ] **Step 2: Write `.gitignore`**

```
node_modules/
.next/
out/
artifacts/
.env*.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 3: Write `lib/tokens.ts` and its failing test**

`tests/unit/tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { TOKENS } from "../../lib/tokens";

describe("design tokens", () => {
  it("matches the main brief section 4.1 palette exactly", () => {
    expect(TOKENS).toMatchObject({
      ink: "#010320",
      body: "#66676C",
      blue: "#0A68F5",
      heroBlue: "#1269EA",
      line: "#E2E8F0",
      lineSoft: "#E9EDF3",
      panel: "#000320",
      white: "#FFFFFF",
      tealTop: "#26FADE",
      tealBottom: "#0EE8CC",
    });
  });

  it("carries the two side colours from update section 7", () => {
    expect(TOKENS.above).toBe("#0EE8CC");
    expect(TOKENS.below).toBe("#A48CFE");
  });

  it("exposes the two spec easings", () => {
    expect(TOKENS.easeOut).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
    expect(TOKENS.easeInOut).toBe("cubic-bezier(0.65, 0, 0.35, 1)");
  });
});
```

- [ ] **Step 4: Run the test and watch it fail**

Run: `npx vitest run tests/unit/tokens.test.ts`
Expected: FAIL, cannot resolve `../../lib/tokens`.

- [ ] **Step 5: Implement `lib/tokens.ts`**

```ts
export const TOKENS = {
  ink: "#010320",
  body: "#66676C",
  blue: "#0A68F5",
  heroBlue: "#1269EA",
  line: "#E2E8F0",
  lineSoft: "#E9EDF3",
  panel: "#000320",
  white: "#FFFFFF",
  tealTop: "#26FADE",
  tealBottom: "#0EE8CC",
  above: "#0EE8CC",
  below: "#A48CFE",
  onBlue80: "rgba(255,255,255,.80)",
  glass40: "rgba(255,255,255,.40)",
  glass8: "rgba(255,255,255,.08)",
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;
```

- [ ] **Step 6: Run the test and watch it pass**

Run: `npx vitest run tests/unit/tokens.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Write `lib/u.ts`**

```ts
/** Artboard unit. Every spec coordinate is authored in 1905-wide pixels. */
export const u = (px: number): string => `calc(${px} * var(--u))`;
```

- [ ] **Step 8: Write `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-ink: #010320;
  --color-body: #66676C;
  --color-blue: #0A68F5;
  --color-hero-blue: #1269EA;
  --color-line: #E2E8F0;
  --color-line-soft: #E9EDF3;
  --color-panel: #000320;
  --color-teal-top: #26FADE;
  --color-teal-bottom: #0EE8CC;
  --color-above: #0EE8CC;
  --color-below: #A48CFE;
  --font-jakarta: var(--font-jakarta-src), ui-sans-serif, system-ui, sans-serif;
  --font-inter: var(--font-inter-src), ui-sans-serif, system-ui, sans-serif;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

html, body { background: #FFFFFF; }
body { font-family: var(--font-inter); color: var(--color-body); }

.tabular { font-variant-numeric: tabular-nums; }

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

/* Main brief 4.3: centred content column. */
.container-recess {
  max-width: 1310px;
  margin-inline: auto;
  padding-inline: 24px;
}

/* Main brief 6.1: proportional artboard. */
.artboard-wrap { container-type: inline-size; max-width: 1920px; margin-inline: auto; }
.artboard { position: relative; --u: calc(100cqw / 1905); }

/* Main brief 4.5: grain. */
.grain {
  position: absolute;
  inset: 0;
  background: url(/textures/grain.png) repeat;
  background-size: 256px;
  mix-blend-mode: overlay;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .2s !important;
  }
}
```

- [ ] **Step 9: Write `app/layout.tsx`**

Providers arrive in Task 6; for now the shell is plain.

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"], weight: ["500", "800"],
  variable: "--font-jakarta-src", display: "swap",
});

const inter = Inter({
  subsets: ["latin"], weight: ["400", "500", "600"],
  variable: "--font-inter-src", display: "swap",
});

export const metadata: Metadata = {
  title: "Recess — Take a Side on the Open",
  description:
    "One question per ticker at every Friday close: above or below at the open? Settled on the reference price, not the pool.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Write `scripts/make-grain.mjs`**

The spec's Python needs NumPy and PIL, neither of which runs on this machine. This writes an equivalent PNG: 256×256, 8-bit greyscale, Gaussian noise at mean 128 and standard deviation 42, clipped to 0–255, seeded for reproducibility.

```js
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const SIZE = 256, MEAN = 128, SD = 42;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(7);
function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const raw = Buffer.alloc((SIZE + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE + 1)] = 0;
  for (let x = 0; x < SIZE; x++) {
    const v = Math.round(MEAN + SD * gauss());
    raw[y * (SIZE + 1) + 1 + x] = Math.min(255, Math.max(0, v));
  }
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

mkdirSync("public/textures", { recursive: true });
writeFileSync("public/textures/grain.png", png);
console.log("wrote public/textures/grain.png", png.length, "bytes");
```

- [ ] **Step 11: Write `scripts/scan-assets.mjs`**

```js
import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "public/images";
const found = [];

function walk(dir, prefix) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(join(dir, e.name), `${prefix}${e.name}/`);
    else if (/\.(webp|png|avif)$/i.test(e.name)) found.push(prefix + e.name);
  }
}
walk(ROOT, "");
found.sort();

mkdirSync("lib", { recursive: true });
writeFileSync(
  "lib/asset-manifest.ts",
  `// GENERATED by scripts/scan-assets.mjs. Do not edit by hand.\n` +
    `export const AVAILABLE = new Set<string>([\n` +
    found.map((f) => `  ${JSON.stringify(f)},`).join("\n") +
    `\n]);\n`
);
console.log(`asset manifest: ${found.length} file(s)`);
```

- [ ] **Step 12: Write `.env.example`**

Update §5 requires every network value to come from env.

```
# Robinhood Chain mainnet. No value is hardcoded in the source.
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_CHAIN_NAME=Robinhood Chain
NEXT_PUBLIC_RPC_URL=
NEXT_PUBLIC_EXPLORER_URL=
NEXT_PUBLIC_USDG_ADDRESS=
NEXT_PUBLIC_RECESS_MARKETS_ADDRESS=
# mock | chain. Falls back to mock when the markets address is empty.
NEXT_PUBLIC_RECESS_MODE=mock
# WalletConnect project id for the RainbowKit modal.
NEXT_PUBLIC_WALLETCONNECT_ID=
```

- [ ] **Step 13: Wire npm scripts**

```json
{
  "scripts": {
    "grain": "node scripts/make-grain.mjs",
    "assets": "node scripts/scan-assets.mjs",
    "predev": "npm run assets",
    "prebuild": "npm run assets",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "accept": "node scripts/acceptance.mjs"
  }
}
```

- [ ] **Step 14: Generate grain and the empty manifest**

Run: `npm run grain && npm run assets`
Expected: `public/textures/grain.png` exists; `lib/asset-manifest.ts` exports an empty set.

- [ ] **Step 15: Rename the reference screenshots**

Mapping confirmed by inspection: `preview.webp` is hero, `preview (1).webp` is features, `preview (2).webp` is solution, `preview (3).webp` is cta.

```bash
cd reference
mv "preview.webp" hero.webp
mv "preview (1).webp" features.webp
mv "preview (2).webp" solution.webp
mv "preview (3).webp" cta.webp
```

- [ ] **Step 16: Write `vitest.config.ts` and `playwright.config.ts`**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", include: ["tests/unit/**/*.test.{ts,tsx}"] },
});
```

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000", viewport: { width: 1905, height: 927 } },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
```

- [ ] **Step 17: Placeholder page and smoke build**

`app/page.tsx`:

```tsx
export default function Home() {
  return <main />;
}
```

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 18: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js, tokens, fonts, grain and asset pipeline

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: The mark, wordmark, lockup and favicon

**Files:**
- Create: `components/ui/Mark.tsx`, `components/ui/Wordmark.tsx`, `components/ui/Lockup.tsx`, `app/icon.svg`, `tests/unit/mark.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `<Mark height={number} className?/>` painting `currentColor`; `<Wordmark size={number} className?/>`; `<Lockup markHeight? wordSize? gap?/>`.

- [ ] **Step 1: Write the failing test**

`tests/unit/mark.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Mark } from "../../components/ui/Mark";

describe("Mark", () => {
  it("uses the spec viewBox and two rounded plates", () => {
    const html = renderToStaticMarkup(<Mark height={34} />);
    expect(html).toContain('viewBox="0 0 36 44"');
    expect(html).toContain('fill="currentColor"');
    expect((html.match(/<rect/g) ?? []).length).toBe(2);
  });

  it("is hidden from assistive technology", () => {
    expect(renderToStaticMarkup(<Mark height={11} />)).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/unit/mark.test.tsx`
Expected: FAIL, cannot resolve `Mark`.

- [ ] **Step 3: Implement `components/ui/Mark.tsx`**

Geometry comes from `recess-mark.svg`. That file carries a large C2PA metadata block; the component reproduces only the two rects, so the metadata never ships.

```tsx
export function Mark({ height, className }: { height: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 36 44"
      height={height}
      width={(height * 36) / 44}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="2" y="24" width="14" height="18" rx="4" />
      <rect x="20" y="2" width="14" height="18" rx="4" />
    </svg>
  );
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run tests/unit/mark.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Implement `Wordmark` and `Lockup`**

Main §5: `recess` lowercase, Plus Jakarta Sans 800, tracking −0.03em. Header lockup is a 34px mark, 10px gap and a 40px word, about 160×34, white.

```tsx
// components/ui/Wordmark.tsx
export function Wordmark({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-jakarta)", fontWeight: 800,
        fontSize: size, letterSpacing: "-0.03em", lineHeight: 1,
      }}
    >
      recess
    </span>
  );
}
```

```tsx
// components/ui/Lockup.tsx
import Link from "next/link";
import { Mark } from "./Mark";
import { Wordmark } from "./Wordmark";

export function Lockup({ markHeight = 34, wordSize = 40, gap = 10 }) {
  return (
    <Link href="/" aria-label="Recess" className="inline-flex items-center text-white" style={{ gap }}>
      <Mark height={markHeight} />
      <Wordmark size={wordSize} />
    </Link>
  );
}
```

- [ ] **Step 6: Write `app/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#0A68F5"/>
  <g fill="#FFFFFF" transform="translate(18.9 12) scale(0.59)">
    <rect x="2" y="24" width="14" height="18" rx="4"/>
    <rect x="20" y="2" width="14" height="18" rx="4"/>
  </g>
</svg>
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: temporary Recess mark, wordmark, lockup and favicon

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Epoch schedule and countdown

Update §2 requires the hero pill to show a live countdown computed from the schedule, not from demo data. Update §3.2 fixes the schedule in New York wall time, which means the UTC offset moves between −5 and −4 across the year. Every boundary is therefore resolved through `Intl`, never through a fixed offset.

**Files:**
- Create: `lib/recess/config.ts`, `lib/recess/schedule.ts`, `tests/unit/schedule.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `RECESS_CONFIG`; `etOffsetMs(utcMs: number): number`; `etToUtc(y, m, d, h, min): number`; `epochAt(nowMs: number): Epoch` where `Epoch = { id: string; label: string; openTime: number; lockTime: number; status: "Open" | "Locked" }`; `formatCountdown(ms: number): string`.

- [ ] **Step 1: Write `lib/recess/config.ts`**

Update §10 lists these as placeholders awaiting sign-off. They live in one file so agreeing them later is a single edit.

```ts
/**
 * Values marked TO AGREE are placeholders from update section 10.
 * They are deliberately conservative and must be confirmed before launch.
 */
export const RECESS_CONFIG = {
  /** TO AGREE. Protocol fee in basis points. */
  feeBps: 200,
  /** TO AGREE. Hours after lock without a fresh reference print before the market voids. */
  voidAfterHours: 12,
  /** TO AGREE. Minimum stake in USDG. */
  minStake: 1,
  /** TO AGREE. Launch ticker list. */
  tickers: ["NVDA", "TSLA", "AAPL", "META", "HIMS"] as const,
  usdgDecimals: 6,
} as const;

export const ENV = {
  mode: process.env.NEXT_PUBLIC_RECESS_MODE ?? "mock",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0),
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME ?? "Robinhood Chain",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL ?? "",
  usdgAddress: process.env.NEXT_PUBLIC_USDG_ADDRESS ?? "",
  marketsAddress: process.env.NEXT_PUBLIC_RECESS_MARKETS_ADDRESS ?? "",
  walletConnectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "",
} as const;

/** Update section 6: chain mode needs a markets address, otherwise mock. */
export const isMock = (): boolean => ENV.mode !== "chain" || ENV.marketsAddress === "";
```

- [ ] **Step 2: Write the failing schedule test**

`tests/unit/schedule.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { etOffsetMs, etToUtc, epochAt, formatCountdown } from "../../lib/recess/schedule";

const H = 3_600_000;

describe("New York wall time", () => {
  it("is five hours behind UTC in winter", () => {
    expect(etOffsetMs(Date.UTC(2026, 0, 15, 12))).toBe(-5 * H);
  });

  it("is four hours behind UTC in summer", () => {
    expect(etOffsetMs(Date.UTC(2026, 6, 15, 12))).toBe(-4 * H);
  });

  it("maps a winter Friday close to 21:00 UTC", () => {
    expect(etToUtc(2026, 2, 13, 16, 0)).toBe(Date.UTC(2026, 1, 13, 21, 0));
  });

  it("maps a summer Friday close to 20:00 UTC", () => {
    expect(etToUtc(2026, 7, 17, 16, 0)).toBe(Date.UTC(2026, 6, 17, 20, 0));
  });
});

describe("epochAt", () => {
  it("opens on the Friday close and locks on the Sunday", () => {
    // Saturday 2026-09-12, 12:00 ET.
    const e = epochAt(etToUtc(2026, 9, 12, 12, 0));
    expect(e.openTime).toBe(etToUtc(2026, 9, 11, 16, 0));
    expect(e.lockTime).toBe(etToUtc(2026, 9, 13, 19, 0));
    expect(e.status).toBe("Open");
    expect(e.label).toBe("Weekend of Sep 11–14");
  });

  it("is locked once the Sunday cutoff has passed", () => {
    const e = epochAt(etToUtc(2026, 9, 13, 20, 0));
    expect(e.status).toBe("Locked");
  });

  it("still belongs to the previous Friday on a Wednesday", () => {
    const e = epochAt(etToUtc(2026, 9, 16, 10, 0));
    expect(e.openTime).toBe(etToUtc(2026, 9, 11, 16, 0));
    expect(e.status).toBe("Locked");
  });

  it("rolls back a week when the Friday close has not happened yet", () => {
    // Friday 2026-09-11 at 09:00 ET, before the 16:00 close.
    const e = epochAt(etToUtc(2026, 9, 11, 9, 0));
    expect(e.openTime).toBe(etToUtc(2026, 9, 4, 16, 0));
  });
});

describe("formatCountdown", () => {
  it("renders days, hours and minutes", () => {
    expect(formatCountdown(2 * 86_400_000 + 4 * H + 12 * 60_000)).toBe("2d 04h 12m");
  });
  it("drops the day when there is none", () => {
    expect(formatCountdown(4 * H + 5 * 60_000)).toBe("04h 05m");
  });
  it("floors at zero", () => {
    expect(formatCountdown(-1)).toBe("0m");
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run tests/unit/schedule.test.ts`
Expected: FAIL, cannot resolve `../../lib/recess/schedule`.

- [ ] **Step 4: Implement `lib/recess/schedule.ts`**

```ts
export type EpochStatus = "Open" | "Locked" | "Settled" | "Void";

export type Epoch = {
  id: string;
  label: string;
  openTime: number;
  lockTime: number;
  status: "Open" | "Locked";
};

/** Update section 3.2. Holidays and shifts are listed here. */
export const SCHEDULE = {
  timeZone: "America/New_York",
  open: { weekday: 5, hour: 16, minute: 0 },
  lock: { weekday: 0, hour: 19, minute: 0 },
  /** TO AGREE. ISO dates on which the Friday close shifts. */
  holidays: [] as string[],
} as const;

const DAY = 86_400_000;

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHEDULE.timeZone, hour12: false,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fields(utcMs: number) {
  const out: Record<string, string> = {};
  for (const p of PARTS.formatToParts(new Date(utcMs))) out[p.type] = p.value;
  return {
    year: +out.year, month: +out.month, day: +out.day,
    hour: +out.hour % 24, minute: +out.minute, second: +out.second,
    weekday: WEEKDAYS.indexOf(out.weekday),
  };
}

/** Offset of New York from UTC at this instant, in milliseconds. Negative. */
export function etOffsetMs(utcMs: number): number {
  const f = fields(utcMs);
  const asUtc = Date.UTC(f.year, f.month - 1, f.day, f.hour, f.minute, f.second);
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** UTC milliseconds for a wall-clock moment in New York. */
export function etToUtc(y: number, m: number, d: number, h: number, min: number): number {
  const guess = Date.UTC(y, m - 1, d, h, min);
  // One correction pass is enough: the offset only changes by an hour.
  const corrected = guess - etOffsetMs(guess);
  return guess - etOffsetMs(corrected);
}

export function epochAt(nowMs: number): Epoch {
  const f = fields(nowMs);
  // Walk back to the most recent Friday in New York.
  const backToFriday = (f.weekday - SCHEDULE.open.weekday + 7) % 7;
  let friday = etToUtc(f.year, f.month, f.day - backToFriday, SCHEDULE.open.hour, SCHEDULE.open.minute);
  if (friday > nowMs) {
    const g = fields(friday - 7 * DAY);
    friday = etToUtc(g.year, g.month, g.day, SCHEDULE.open.hour, SCHEDULE.open.minute);
  }

  const fri = fields(friday);
  const lock = etToUtc(fri.year, fri.month, fri.day + 2, SCHEDULE.lock.hour, SCHEDULE.lock.minute);
  const mon = fields(friday + 3 * DAY);

  return {
    id: `${fri.year}-${String(fri.month).padStart(2, "0")}-${String(fri.day).padStart(2, "0")}`,
    label: `Weekend of ${MONTHS[fri.month - 1]} ${fri.day}\u2013${mon.day}`,
    openTime: friday,
    lockTime: lock,
    status: nowMs < lock ? "Open" : "Locked",
  };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0m";
  const total = Math.floor(ms / 60_000);
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  if (d > 0) return `${d}d ${hh}h ${mm}m`;
  if (h > 0) return `${hh}h ${mm}m`;
  return `${m}m`;
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run tests/unit/schedule.test.ts`
Expected: PASS, 10 tests. If the label test fails on the en dash, confirm the source uses `\u2013` and not a hyphen.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: epoch schedule in New York wall time with DST-safe boundaries

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Copy module and its guard test

**Files:**
- Create: `lib/copy.ts`, `tests/unit/copy.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `COPY`, keyed by slot.

- [ ] **Step 1: Write `lib/copy.ts`**

Main brief Appendix A, with every slot the corrective brief §2 replaces already replaced.

```ts
export const COPY = {
  hero: {
    h1: ["Friday Closed.", "Monday Decides."],
    locksIn: "Locks in",
    settling: "Settling at the open",
    connect: "Connect wallet",
    launch: "Launch app",
  },
  features: {
    badge: "Welcome to Recess",
    h2: "One Question per Ticker",
    lead: "Every Friday at the close: will Monday open above or below?",
    card1: {
      h3: "Settles on the Stock, Never the Pool",
      body:
        "Every market resolves on the Chainlink reference price when the feed wakes up. A meme that corners the float can move the pool. It can't move the result.",
    },
    card2: {
      body:
        "A parimutuel pool in USDG for every ticker. No market maker, no order book: the two sides fund each other.",
    },
    card3: {
      body:
        "Pick a side before the bell. Above or below Friday's close, one tap, straight from your wallet.",
      button: "Open the board",
    },
    card4: {
      h3: "Weekend Prices Are a Rumor",
      body:
        "When the exchange is closed, a thin pool is the only price. Recess lets you take a side on the gap without trusting that print.",
    },
  },
  solution: {
    badge: "How It Works",
    h2:
      "Markets Open at Friday's Close, Stay Open While the Reference Sleeps, and Settle on Its First Fresh Print.",
    left:
      "Pick a ticker and a side: above Friday's close or below it. Stake USDG from your wallet. No account, no margin, nothing to manage.",
    right:
      "When the feed prints again, the winning side splits the pool pro rata. The weekend price was a rumor. The open is the answer.",
  },
  showcase: {
    groups: [
      {
        title: "Pick a Side",
        bullets: [
          ["Above or below:", "one question per ticker, asked at every Friday close."],
          ["One tap:", "stake USDG straight from your wallet."],
          ["Clear cutoff:", "bets lock before the reference price wakes up."],
        ],
      },
      {
        title: "The Weekend Pool",
        bullets: [
          ["Parimutuel:", "both sides fund a single pool."],
          ["No house:", "no market maker, no order book, no counterparty."],
          ["Live split:", "the balance between sides updates as stakes come in."],
        ],
      },
      {
        title: "Settlement",
        bullets: [
          ["Reference, not pool:", "results come from the Chainlink feed, not an AMM price."],
          ["First fresh print:", "the market settles on the first reference tick after the weekend."],
          ["Pro rata:", "the winning side splits the pool by stake."],
        ],
      },
    ],
    slide2: { title: "NVDA Pool", sub: "Open until the reference wakes up." },
    slide3: { pill: "Settled" },
  },
  cta: {
    h2: "Be There When the Bell Rings",
    lead: "The board opens at every Friday close.",
  },
  footer: {
    copyright: "© 2026 Recess. All rights reserved.",
    disclaimer:
      "Not affiliated with Robinhood Markets. Not available in the US and other restricted jurisdictions.",
    terms: "Terms",
    risk: "Risk",
  },
} as const;
```

- [ ] **Step 2: Write the guard test**

This enforces main §1 mechanically, so a later edit cannot smuggle a banned word in.

`tests/unit/copy.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { COPY } from "../../lib/copy";

const flatten = (v: unknown): string[] =>
  typeof v === "string" ? [v]
  : Array.isArray(v) ? v.flatMap(flatten)
  : v && typeof v === "object" ? Object.values(v).flatMap(flatten)
  : [];

const ALL = flatten(COPY);
const TEXT = ALL.join(" ").toLowerCase();

describe("site copy obeys main brief section 1", () => {
  it("makes no yield or return promise", () => {
    for (const word of ["apy", "earn", "profit", "returns", "yield"]) {
      expect(TEXT, word).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });

  it("makes no superlative claim", () => {
    // "first fresh print" is an ordinal describing the reference tick, not a claim.
    expect(TEXT).not.toMatch(/\b(the|world's|market's)\s+first\b/);
    for (const word of ["only", "guaranteed"]) {
      expect(TEXT, word).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });

  it("never implies a Robinhood affiliation outside the disclaimer", () => {
    const others = ALL.filter((s) => s !== COPY.footer.disclaimer);
    expect(others.join(" ")).not.toMatch(/robinhood/i);
  });

  it("has no trace of the waitlist the corrective brief removed", () => {
    expect(TEXT).not.toMatch(/waitlist|your email|join the list/);
  });
});
```

- [ ] **Step 3: Run it and watch it pass**

Run: `npx vitest run tests/unit/copy.test.ts`
Expected: PASS, 4 tests. The corrective brief's CTA lead already avoids the banned ordinal, so no copy deviation is needed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: copy module with a guard test for the brief's language rules

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Motion primitives and asset slots

**Files:**
- Create: `components/ui/BlurWords.tsx`, `components/ui/Reveal.tsx`, `components/ui/Float.tsx`, `components/ui/Asset.tsx`, `components/ui/AssetBox.tsx`

**Interfaces:**
- Consumes: `AVAILABLE` from `lib/asset-manifest`, `u` from `lib/u`.
- Produces: `<BlurWords as? text delay? className? style? .../>`; `<Reveal delay? stagger? className? style?/>`; `<Float y? rotate? period? phase? className? style?/>`; `<Asset src intrinsic alt? priority? className?/>`; `<AssetBox src x y w h z? intrinsic priority? float?/>`.

- [ ] **Step 1: Implement `BlurWords`**

Main §7.2: split on words keeping spaces, each word opacity 0→1, blur 10→0, y 12→0, 0.7s ease-out, 0.08s step. The heading stays plain text for screen readers.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  as?: "h1" | "h2" | "h3";
  text: string | string[];
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function BlurWords({ as = "h2", text, delay = 0, className, style, ...rest }: Props & Record<string, unknown>) {
  const reduced = useReducedMotion();
  const lines = Array.isArray(text) ? text : [text];
  const plain = lines.join(" ");
  let index = 0;
  const Tag = motion[as];

  return (
    <Tag className={className} style={style} aria-label={plain} {...rest}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {line.split(" ").map((word) => {
            const i = index++;
            return (
              <motion.span
                key={`${li}-${i}`}
                className="inline-block whitespace-pre"
                initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 12 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={
                  reduced
                    ? { duration: 0.2 }
                    : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.08 }
                }
              >
                {`${word} `}
              </motion.span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
```

- [ ] **Step 2: Implement `Reveal`**

Main §7.3: opacity 0→1, y 24→0, blur 6→0, 0.8s ease-out, children staggered 0.12s.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children, delay = 0, stagger = 0, className, style,
}: {
  children: React.ReactNode; delay?: number; stagger?: number;
  className?: string; style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduced
          ? { duration: 0.2 }
          : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay, staggerChildren: stagger }
      }
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Implement `Float`**

Main §7.4: sine, ease-in-out, back and forth, forever. `phase` is a negative delay so objects fall out of step.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

export function Float({
  children, y = 10, rotate = 0, period = 6, phase = 0, className, style,
}: {
  children: React.ReactNode; y?: number; rotate?: number; period?: number;
  phase?: number; className?: string; style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      animate={{ y: [0, -y, 0], rotate: rotate ? [-rotate, rotate, -rotate] : undefined }}
      transition={{
        duration: period, ease: [0.65, 0, 0.35, 1],
        repeat: Infinity, repeatType: "loop", delay: phase,
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Implement `Asset` and `AssetBox`**

```tsx
// components/ui/Asset.tsx
"use client";

import Image from "next/image";
import { AVAILABLE } from "@/lib/asset-manifest";

export function Asset({
  src, intrinsic, alt = "", priority = false, className,
}: {
  src: string; intrinsic: { w: number; h: number };
  alt?: string; priority?: boolean; className?: string;
}) {
  if (!AVAILABLE.has(src)) {
    return (
      <div
        data-placeholder={src}
        aria-hidden="true"
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-[6px] border border-dashed border-[rgba(10,104,245,.45)] bg-[rgba(10,104,245,.12)] text-center ${className ?? ""}`}
      >
        <span className="px-1 font-mono text-[10px] leading-[1.15] break-all text-[rgba(10,104,245,.9)]">
          {src}
        </span>
      </div>
    );
  }
  return (
    <Image
      src={`/images/${src}`}
      alt={alt}
      width={intrinsic.w}
      height={intrinsic.h}
      priority={priority}
      aria-hidden={alt === "" ? true : undefined}
      className={`h-full w-full object-contain ${className ?? ""}`}
    />
  );
}
```

```tsx
// components/ui/AssetBox.tsx
"use client";

import { u } from "@/lib/u";
import { Asset } from "./Asset";
import { Float } from "./Float";

export function AssetBox({
  src, x, y, w, h, z = 1, intrinsic, priority, float,
}: {
  src: string; x: number; y: number; w: number; h: number; z?: number;
  intrinsic: { w: number; h: number }; priority?: boolean;
  float?: { y: number; rotate?: number; period: number; phase?: number };
}) {
  const box = (
    <div style={{ width: "100%", height: "100%" }}>
      <Asset src={src} intrinsic={intrinsic} priority={priority} />
    </div>
  );
  return (
    <div
      className="absolute"
      style={{ left: u(x), top: u(y), width: u(w), height: u(h), zIndex: z }}
      data-asset={src}
    >
      {float ? <Float {...float} className="h-full w-full">{box}</Float> : box}
    </div>
  );
}
```

- [ ] **Step 5: Type-check and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: motion primitives and image-or-placeholder asset slots

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Wallet providers and the entry pill

The user's decision: the hero header stays exactly as the reference, a centred lockup and nothing else. Wallet connection lives in the dark half of the 460×59 pill. The pill keeps its geometry, so the section 12 overlay stays clean.

**Files:**
- Create: `lib/wallet/chain.ts`, `lib/wallet/config.ts`, `app/providers.tsx`, `components/ui/LaunchPill.tsx`, `tests/unit/launch-pill.test.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `ENV` from `lib/recess/config`, `epochAt` and `formatCountdown` from `lib/recess/schedule`, `COPY`.
- Produces: `robinhoodChain` viem chain; `wagmiConfig`; `<Providers>`; `<LaunchPill variant="hero" | "cta" id?/>`.

- [ ] **Step 1: Install the wallet stack**

```bash
npm i wagmi viem @tanstack/react-query @rainbow-me/rainbowkit
```

- [ ] **Step 2: Implement the chain and wagmi config**

Update §5: every network value comes from env, nothing is hardcoded.

```ts
// lib/wallet/chain.ts
import { defineChain } from "viem";
import { ENV } from "@/lib/recess/config";

export const robinhoodChain = defineChain({
  id: ENV.chainId || 1,
  name: ENV.chainName,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ENV.rpcUrl ? [ENV.rpcUrl] : [] } },
  blockExplorers: ENV.explorerUrl
    ? { default: { name: "Explorer", url: ENV.explorerUrl } }
    : undefined,
});
```

```ts
// lib/wallet/config.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { robinhoodChain } from "./chain";
import { ENV } from "@/lib/recess/config";

export const wagmiConfig = getDefaultConfig({
  appName: "Recess",
  projectId: ENV.walletConnectId || "recess-local",
  chains: [robinhoodChain],
  ssr: true,
});
```

- [ ] **Step 3: Implement `app/providers.tsx` and mount it**

Wallet state is global so the landing can connect. RainbowKit's own styles are imported here, keeping them out of the server bundle.

```tsx
"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { wagmiConfig } from "@/lib/wallet/config";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: "#0A68F5", borderRadius: "large" })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

In `app/layout.tsx`, wrap the body: `<body><Providers>{children}</Providers></body>`.

- [ ] **Step 4: Write the failing pill test**

The countdown depends on the current time, so it must never render during SSR or hydration will mismatch. The test locks that in.

`tests/unit/launch-pill.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LaunchPill } from "../../components/ui/LaunchPill";

describe("LaunchPill", () => {
  it("renders no live time on the server, so hydration cannot mismatch", () => {
    const html = renderToStaticMarkup(<LaunchPill variant="hero" />);
    expect(html).not.toMatch(/\d+d \d\d h?/);
    expect(html).toContain("Locks in");
  });

  it("links into the app", () => {
    expect(renderToStaticMarkup(<LaunchPill variant="hero" />)).toContain('href="/app"');
  });
});
```

- [ ] **Step 5: Run it and watch it fail**

Run: `npx vitest run tests/unit/launch-pill.test.tsx`
Expected: FAIL, cannot resolve `LaunchPill`.

- [ ] **Step 6: Implement `components/ui/LaunchPill.tsx`**

Update §2 geometry: the 460×59 dark `ink` pill keeps its shape. The white 288px half carries the countdown, `Locks in` in `body` and the time in `ink`. Once betting closes it reads `Settling at the open`. The dark half offers `Connect wallet` while disconnected and `Launch app` once connected. The countdown refreshes once a minute.

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { epochAt, formatCountdown } from "@/lib/recess/schedule";
import { COPY } from "@/lib/copy";

function Countdown() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const epoch = epochAt(now);
      setText(epoch.status === "Open" ? formatCountdown(epoch.lockTime - now) : null);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // Server and first client paint agree on this branch.
  if (text === null) {
    return (
      <span className="flex items-baseline gap-2">
        <span className="text-body">{COPY.hero.locksIn}</span>
        <span className="tabular text-ink">&nbsp;</span>
      </span>
    );
  }
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-body">{COPY.hero.locksIn}</span>
      <span className="tabular text-ink">{text}</span>
    </span>
  );
}

function Settling() {
  return <span className="text-ink">{COPY.hero.settling}</span>;
}

export function LaunchPill({ variant, id }: { variant: "hero" | "cta"; id?: string }) {
  const { isConnected } = useAccount();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const tick = () => setLocked(epochAt(Date.now()).status !== "Open");
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      id={id}
      data-testid={`launch-pill-${variant}`}
      className="flex h-[59px] w-[460px] max-w-full items-center rounded-full bg-ink"
    >
      <Link
        href="/app"
        className="flex h-full w-[288px] shrink-0 items-center rounded-full border-2 border-ink bg-white px-[26px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue"
        style={{ fontFamily: "var(--font-inter)", fontSize: 18 }}
      >
        {locked ? <Settling /> : <Countdown />}
      </Link>

      {isConnected ? (
        <Link
          href="/app"
          className="flex h-full flex-1 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-[#0D1238] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
          style={{ fontFamily: "var(--font-inter)", fontSize: 18 }}
        >
          {COPY.hero.launch}
        </Link>
      ) : (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              type="button"
              onClick={openConnectModal}
              className="h-full flex-1 rounded-full text-white transition-colors duration-200 hover:bg-[#0D1238] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
              style={{ fontFamily: "var(--font-inter)", fontSize: 18 }}
            >
              {COPY.hero.connect}
            </button>
          )}
        </ConnectButton.Custom>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Run it and watch it pass**

Run: `npx vitest run tests/unit/launch-pill.test.tsx`
Expected: PASS, 2 tests. If `useAccount` throws outside a provider, wrap the component under test in a minimal `WagmiProvider` inside the test file.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: global wallet providers and the wallet-aware entry pill

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Hero section

**Files:**
- Create: `components/sections/Hero.tsx`, `components/sections/HeroDecor.tsx`
- Modify: `app/page.tsx`, `app/globals.css`, `tsconfig.json`

**Interfaces:**
- Consumes: `Lockup`, `BlurWords`, `LaunchPill`, `AssetBox`, `Mark`, `u`.
- Produces: `<Hero />`; DOM contracts the E2E tests rely on — `[data-testid="hero"]`, `[data-testid="hero-h1"]`, `[data-testid="launch-pill-hero"]`, and one `data-asset` node per hero object.

- [ ] **Step 1: Add the hero background to `app/globals.css`**

Main §6.1. Stops are the starting point; tune them against the reference in Step 7.

```css
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse calc(960 * var(--u)) calc(820 * var(--u)) at 50% 0%,
      #1269EA 0%, #1A70EF 24%, #3C85F1 39%, #85B3F6 54%,
      #D0E2FC 68%, #F5F9FF 83%, rgba(255,255,255,0) 100%),
    #FFFFFF;
}
.hero-grain {
  opacity: .35;
  -webkit-mask-image: radial-gradient(ellipse calc(960 * var(--u)) calc(820 * var(--u)) at 50% 0%, #000 60%, transparent 100%);
  mask-image: radial-gradient(ellipse calc(960 * var(--u)) calc(820 * var(--u)) at 50% 0%, #000 60%, transparent 100%);
}
```

- [ ] **Step 2: Implement `components/sections/HeroDecor.tsx`**

Main §6.1 dots and strokes, drawn in code because they are flat.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { u } from "@/lib/u";

const DOTS: Array<[number, number, number]> = [
  [920, 208, 10], [1357, 172, 12], [1301, 473, 8], [935, 497, 4],
  [1471, 210, 6], [1374, 516, 4], [1407, 540, 3],
];
const DASH = [0, 1, 2, 3].map((i) => [472 + i * 17, 358, 4] as [number, number, number]);
const STROKES: Array<[number, number, number]> = [
  [940, 205, 38], [952, 180, 38], [1380, 210, 96], [686, 313, 72], [1480, 260, 240],
];

export function HeroDecor() {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 4 }} aria-hidden="true">
      {[...DOTS, ...DASH].map(([x, y, d], i) => (
        <motion.span
          key={`d${i}`}
          className="absolute rounded-full bg-white"
          style={{ left: u(x), top: u(y), width: u(d), height: u(d), boxShadow: "0 0 12px rgba(255,255,255,.8)" }}
          animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={reduced ? undefined : { duration: 2.4 + (i % 5) * 0.3, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        />
      ))}
      {STROKES.map(([x, y, len], i) => (
        <span
          key={`s${i}`}
          className="absolute"
          style={{
            left: u(x), top: u(y), width: u(len), height: 1,
            transform: "rotate(-22deg)", transformOrigin: "left center",
            background: "linear-gradient(90deg, rgba(255,255,255,.7), rgba(255,255,255,0))",
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Implement `components/sections/Hero.tsx`**

Every number comes straight from main §6.1's object table and §7.1's load timeline. The form slot is now the entry pill, same 460×59 box at the same position.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { Lockup } from "@/components/ui/Lockup";
import { BlurWords } from "@/components/ui/BlurWords";
import { LaunchPill } from "@/components/ui/LaunchPill";
import { AssetBox } from "@/components/ui/AssetBox";
import { Mark } from "@/components/ui/Mark";
import { HeroDecor } from "./HeroDecor";
import { COPY } from "@/lib/copy";
import { u } from "@/lib/u";

export function Hero() {
  const reduced = useReducedMotion();
  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, filter: "blur(14px)", scale: 0.97 },
          animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
          transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay },
        };

  return (
    <section className="artboard-wrap" data-testid="hero">
      <div className="artboard overflow-hidden" style={{ height: u(927) }}>
        <div className="hero-bg" />
        <div className="grain hero-grain" />

        <motion.div {...rise(0.15)}>
          <AssetBox src="hero/coin-tsla.webp" x={543} y={293} w={155} h={200} z={2}
            intrinsic={{ w: 900, h: 900 }} priority float={{ y: 8, rotate: 1, period: 6.8, phase: -3.1 }} />
          <AssetBox src="hero/coin-meta.webp" x={1205} y={158} w={185} h={175} z={2}
            intrinsic={{ w: 900, h: 900 }} priority float={{ y: 8, rotate: 1, period: 7.8, phase: -0.9 }} />
        </motion.div>

        <motion.div {...rise(0.15)}>
          <AssetBox src="hero/ribbon.webp" x={0} y={250} w={1905} h={480} z={3}
            intrinsic={{ w: 3840, h: 968 }} priority />
        </motion.div>

        <motion.div {...rise(0.21)}>
          <AssetBox src="hero/coin-nvda.webp" x={778} y={200} w={212} h={225} z={4}
            intrinsic={{ w: 600, h: 600 }} priority float={{ y: 12, rotate: 1.5, period: 6.4, phase: 0 }} />
          <AssetBox src="hero/coin-aapl.webp" x={993} y={108} w={165} h={165} z={4}
            intrinsic={{ w: 500, h: 500 }} priority float={{ y: 10, rotate: 2, period: 7.2, phase: -1.8 }} />
          <AssetBox src="hero/chip-up.webp" x={705} y={398} w={88} h={72} z={4}
            intrinsic={{ w: 300, h: 250 }} float={{ y: 6, period: 4.6, phase: -0.4 }} />
          <AssetBox src="hero/chip-bell.webp" x={1083} y={250} w={58} h={56} z={4}
            intrinsic={{ w: 200, h: 200 }} float={{ y: 6, period: 5.4, phase: -2.2 }} />
          <AssetBox src="hero/chip-clock.webp" x={473} y={573} w={40} h={40} z={4}
            intrinsic={{ w: 160, h: 160 }} float={{ y: 6, period: 5.0, phase: -1.1 }} />
          <div className="absolute" style={{ left: u(1395), top: u(313), width: u(40), height: u(40), zIndex: 4 }}>
            <AssetBox src="hero/chip-blank.webp" x={0} y={0} w={40} h={40} z={1} intrinsic={{ w: 160, h: 160 }} />
            <span className="absolute inset-0 flex items-center justify-center text-blue" style={{ zIndex: 2 }}>
              <Mark height={18} />
            </span>
          </div>
        </motion.div>

        <HeroDecor />

        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: u(46), zIndex: 5 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Lockup />
        </motion.div>

        <BlurWords
          as="h1"
          text={COPY.hero.h1}
          delay={0.35}
          data-testid="hero-h1"
          className="absolute left-1/2 w-full -translate-x-1/2 text-center text-ink"
          style={{
            top: u(604), zIndex: 5,
            fontFamily: "var(--font-jakarta)", fontWeight: 500,
            fontSize: "max(56px, calc(102 * var(--u)))",
            lineHeight: 1, letterSpacing: "-0.0075em",
          }}
        />

        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: u(836), zIndex: 5 }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <LaunchPill variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Mount it and add the path alias**

`app/page.tsx`:

```tsx
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
```

`tsconfig.json`: `{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./*"] } } }`

- [ ] **Step 5: Check it in the browser**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: blue radial hero, centred lockup, two-line headline, the entry pill reading `Locks in …` beside `Connect wallet`, and ten labelled placeholder rectangles at the spec positions.

- [ ] **Step 6: Type-check and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: hero artboard with proportional scaling, decor and load sequence

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Acceptance harness and hero geometry tests — CHECKPOINT

**Files:**
- Create: `tests/e2e/hero.spec.ts`, `tests/e2e/a11y.spec.ts`, `scripts/acceptance.mjs`

**Interfaces:**
- Consumes: the hero DOM contracts from Task 7.
- Produces: `npm run test:e2e` and `npm run accept`, the latter writing `artifacts/shot-*.png` and `artifacts/overlay-*.png`.

- [ ] **Step 1: Write the failing hero geometry test**

`tests/e2e/hero.spec.ts`:

```ts
import { test, expect, type Page } from "@playwright/test";

const W = 1905;
const near = (actual: number, expected: number, tol = 4) =>
  expect(Math.abs(actual - expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(tol);

async function box(page: Page, selector: string) {
  const b = await page.locator(selector).first().boundingBox();
  if (!b) throw new Error(`no box for ${selector}`);
  return b;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1500);
});

test("headline uses the spec type at 1905", async ({ page }) => {
  const h1 = page.locator('[data-testid="hero-h1"]');
  await expect(h1).toHaveCount(1);
  near(parseFloat(await h1.evaluate((el) => getComputedStyle(el).fontSize)), 102, 0.5);
  expect(await h1.evaluate((el) => getComputedStyle(el).fontWeight)).toBe("500");
});

test("the entry pill is 460 by 59 and centred", async ({ page }) => {
  const b = await box(page, '[data-testid="launch-pill-hero"]');
  near(b.width, 460);
  near(b.height, 59);
  near(b.x + b.width / 2, W / 2);
});

test("the pill offers a wallet connection and a way into the app", async ({ page }) => {
  const pill = page.locator('[data-testid="launch-pill-hero"]');
  await expect(pill).toContainText(/Locks in|Settling at the open/);
  await expect(pill.getByRole("button", { name: "Connect wallet" })).toBeVisible();
  await expect(pill.getByRole("link").first()).toHaveAttribute("href", "/app");
});

test("hero objects sit at the spec coordinates", async ({ page }) => {
  const table: Array<[string, number, number, number, number]> = [
    ["hero/ribbon.webp", 0, 250, 1905, 480],
    ["hero/coin-tsla.webp", 543, 293, 155, 200],
    ["hero/coin-nvda.webp", 778, 200, 212, 225],
    ["hero/coin-aapl.webp", 993, 108, 165, 165],
    ["hero/coin-meta.webp", 1205, 158, 185, 175],
    ["hero/chip-up.webp", 705, 398, 88, 72],
    ["hero/chip-bell.webp", 1083, 250, 58, 56],
    ["hero/chip-clock.webp", 473, 573, 40, 40],
  ];
  for (const [src, x, y, w, h] of table) {
    const b = await box(page, `[data-asset="${src}"]`);
    near(b.x, x, 5);
    near(b.width, w, 5);
    near(b.height, h, 5);
    near(b.y, y, 16); // idle float moves y
  }
});

test("the page does not scroll sideways at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
```

- [ ] **Step 2: Write the accessibility test**

`tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("there is exactly one h1 and it reads as plain text", async ({ page }) => {
  await page.goto("/");
  const h1 = page.locator("h1");
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveAttribute("aria-label", "Friday Closed. Monday Decides.");
});

test("the lockup is a labelled link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Recess" })).toBeVisible();
});

test("no hydration mismatch is reported", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/");
  await page.waitForTimeout(2000);
  expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
});

test("reduced motion removes blur and translation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(1200);
  const blurred = await page.evaluate(() =>
    [...document.querySelectorAll("*")].some((el) => {
      const f = getComputedStyle(el).filter;
      return f && f !== "none" && f.includes("blur") && !f.includes("blur(0px)");
    })
  );
  expect(blurred).toBe(false);
});
```

- [ ] **Step 3: Run the E2E suite and fix the hero until it is green**

Run: `npm run test:e2e`
Expected: every assertion passes. The float tolerance on `y` is deliberate; do not widen the `x`, `width` or `height` tolerances to make a test pass.

- [ ] **Step 4: Write `scripts/acceptance.mjs`**

Main §12.1. Captures the four positions, then composites each against its reference at 50% inside a browser page, which handles both the 1568→1905 upscale and the WebP decode with no native dependency.

```js
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const W = 1905, H = 927;
const OUT = "artifacts";
mkdirSync(OUT, { recursive: true });

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
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

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
  await overlay.waitForTimeout(300);
  await overlay.screenshot({ path: resolve(OUT, `overlay-${name}.png`) });
  console.log(`overlay ${name}`);
}

await browser.close();
console.log(`\nOpen ${OUT}/overlay-*.png and compare against main brief section 12.2 tolerances.`);
```

- [ ] **Step 5: Run the harness**

Run: `npm run dev` in one shell, `npm run accept` in another.
Expected: `artifacts/shot-hero.png` and `artifacts/overlay-hero.png` exist. The other three warn and skip until their sections land.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: hero geometry and accessibility suites, plus the overlay acceptance harness

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 7: STOP — checkpoint**

Report to the user: hero built, tests green, overlay written. Show `artifacts/overlay-hero.png`. Do not start Task 9 until they approve the direction.

---

### Task 9: Features shell

**Files:**
- Create: `components/sections/Features.tsx`, `components/ui/Badge.tsx`, stubs for `components/features/Card1.tsx` … `Card4.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `Badge`, `BlurWords`, `Reveal`, `Mark`, `COPY`.
- Produces: `<Features />`; `<Badge variant="light"|"glass" text/>`; DOM contract `[data-testid="features-h2"]`.

- [ ] **Step 1: Implement `Badge`**

Main §6.2 light badge: height 32, padding `0 6px 0 14px`, background `#F4F7FB`, 1px `line` border, 15px `ink` text, trailing 20px `blue` circle holding an 11px white mark. Main §6.3 glass badge: height 43, padding `0 8px 0 18px`, `glass-40` fill, 1px `line` border, 15px white text, trailing 22px `blue` circle holding a 12px white `Zap`.

```tsx
import { Mark } from "./Mark";
import { Zap } from "lucide-react";

export function Badge({ variant, text }: { variant: "light" | "glass"; text: string }) {
  const light = variant === "light";
  return (
    <span
      className="inline-flex items-center rounded-full border border-line"
      style={{
        height: light ? 32 : 43,
        padding: light ? "0 6px 0 14px" : "0 8px 0 18px",
        gap: light ? 8 : 10,
        background: light ? "#F4F7FB" : "rgba(255,255,255,.40)",
        color: light ? "#010320" : "#FFFFFF",
        fontFamily: "var(--font-inter)", fontSize: 15, lineHeight: 1,
      }}
    >
      {text}
      <span
        className="inline-flex items-center justify-center rounded-full bg-blue text-white"
        style={{ width: light ? 20 : 22, height: light ? 20 : 22 }}
      >
        {light ? <Mark height={11} /> : <Zap size={12} aria-hidden="true" />}
      </span>
    </span>
  );
}
```

- [ ] **Step 2: Add the card shell to `app/globals.css`**

```css
.bento-card {
  background: #FFFFFF;
  border: 1px solid var(--color-line);
  border-radius: 32px;
  overflow: hidden;
  position: relative;
}
```

- [ ] **Step 3: Implement the Features shell**

Main §6.2: 150px above, 140px below. Badge centred, H2 20px under it, lead 28px under that, grid 64px under the lead. Row 1 columns 740 and 548, height 736. Row 2 columns 497 and 791, height 470. Gap 20. Padding 44 in row 1 and 36 in row 2.

```tsx
import { Badge } from "@/components/ui/Badge";
import { BlurWords } from "@/components/ui/BlurWords";
import { Reveal } from "@/components/ui/Reveal";
import { COPY } from "@/lib/copy";
import { Card1 } from "@/components/features/Card1";
import { Card2 } from "@/components/features/Card2";
import { Card3 } from "@/components/features/Card3";
import { Card4 } from "@/components/features/Card4";

export function Features() {
  return (
    <section className="pt-[150px] pb-[140px]">
      <div className="container-recess">
        <div className="flex flex-col items-center text-center">
          <Reveal><Badge variant="light" text={COPY.features.badge} /></Reveal>
          <BlurWords
            as="h2"
            text={COPY.features.h2}
            data-testid="features-h2"
            className="mt-5 text-ink"
            style={{
              fontFamily: "var(--font-jakarta)", fontWeight: 500,
              fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1.1,
            }}
          />
          <Reveal delay={0.1}>
            <p className="mt-7 text-body" style={{ fontFamily: "var(--font-inter)", fontSize: 18, lineHeight: 1.4 }}>
              {COPY.features.lead}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-[740fr_548fr]">
          <Card1 />
          <Card2 />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[497fr_791fr]">
          <Card3 />
          <Card4 />
        </div>
      </div>
    </section>
  );
}
```

Stub each card as `export function CardN() { return <div className="bento-card h-[736px]" />; }` so the shell compiles now. Tasks 10–13 fill them in.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: features section shell, bento grid and badges

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Card 1 and the circle carousel

**Files:**
- Create: `components/features/CircleCarousel.tsx`
- Modify: `components/features/Card1.tsx`

**Interfaces:**
- Consumes: `Asset`, `COPY`.
- Produces: `<Card1 />`, `<CircleCarousel />`.

- [ ] **Step 1: Implement `CircleCarousel`**

Main §6.2 card 1 and §7.5. Pill 431×203 at (154, 80), three ⌀127 discs at x 202/311/420 and y 117, step 109, overlap 18. Slot z-order: middle 3, left 2, right 1. Every 2.2s the left disc travels to the right slot behind the others over 0.6s ease-in-out, scaling 1→.9→1 and lifting y 0→−6→0 with z 0. Paused off-screen.

```tsx
"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";

const DISCS = ["features/circle-blue.webp", "features/circle-dark.webp", "features/circle-lilac.webp"];
const SLOT_X = [202, 311, 420];
const SLOT_Z = [2, 3, 1];

export function CircleCarousel() {
  const reduced = useReducedMotion();
  const [order, rotate] = useReducer((o: number[]) => [...o.slice(1), o[0]], [0, 1, 2]);
  const [moving, setMoving] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const id = setInterval(() => {
      setMoving(order[0]);
      rotate();
      setTimeout(() => setMoving(null), 600);
    }, 2200);
    return () => clearInterval(id);
  }, [reduced, visible, order]);

  return (
    <div ref={ref} className="absolute" style={{ left: 154, top: 80, width: 431, height: 203 }}>
      <div
        className="absolute inset-0 rounded-full bg-white"
        style={{ border: "1px solid #EEF1F6", boxShadow: "0 24px 48px -12px rgba(10,104,245,.14)" }}
      />
      {DISCS.map((src, disc) => {
        const slot = order.indexOf(disc);
        const isMoving = moving === disc;
        return (
          <motion.div
            key={src}
            className="absolute"
            style={{ top: 37, width: 127, height: 127, zIndex: isMoving ? 0 : SLOT_Z[slot] }}
            animate={{
              left: SLOT_X[slot] - 154,
              scale: isMoving ? [1, 0.9, 1] : 1,
              y: isMoving ? [0, -6, 0] : 0,
            }}
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <Asset src={src} intrinsic={{ w: 300, h: 300 }} />
          </motion.div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Implement `Card1`**

Arcs and connectors are 1px `line-soft` strokes with no fill. Left arc centre (−21, 180) ⌀190, right arc centre (761, 180) ⌀190, both clipped by the card. Connectors run at y 180 from 74→154 and 585→666. H3 at x 44, cap top near y 381, three lines via `text-wrap: balance`. Paragraph 18px `body`, max-width 580, 18px below the heading.

```tsx
import { CircleCarousel } from "./CircleCarousel";
import { COPY } from "@/lib/copy";

export function Card1() {
  return (
    <div className="bento-card min-h-[620px] p-11 lg:h-[736px]">
      <div className="relative hidden h-[300px] lg:block">
        {[-21, 761].map((cx) => (
          <span
            key={cx}
            className="absolute rounded-full"
            style={{ left: cx - 95 - 44, top: 180 - 95 - 80, width: 190, height: 190, border: "1px solid var(--color-line-soft)" }}
          />
        ))}
        {([[74, 154], [585, 666]] as const).map(([x1, x2]) => (
          <span
            key={x1}
            className="absolute"
            style={{ left: x1 - 44, top: 180 - 80, width: x2 - x1, height: 1, background: "var(--color-line-soft)" }}
          />
        ))}
        <CircleCarousel />
      </div>

      <h3
        className="mt-8 text-ink lg:mt-[81px]"
        style={{
          fontFamily: "var(--font-jakarta)", fontWeight: 500,
          fontSize: "clamp(40px, 7vw, 76.8px)", lineHeight: 1, textWrap: "balance",
        }}
      >
        {COPY.features.card1.h3}
      </h3>
      <p className="mt-[18px] max-w-[580px] text-body" style={{ fontFamily: "var(--font-inter)", fontSize: 18, lineHeight: 1.4 }}>
        {COPY.features.card1.body}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: bento card 1 with the rotating disc carousel

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: Card 2 and the rail tiles

**Files:**
- Create: `components/features/RailTiles.tsx`
- Modify: `components/features/Card2.tsx`

**Interfaces:**
- Consumes: `Asset`, `COPY`.
- Produces: `<Card2 />`, `<RailTiles />`.

- [ ] **Step 1: Implement `RailTiles`**

Main §6.2 card 2 and §7.6. `rails` fills the card width, pinned to the bottom, 386px tall, `object-fit: cover` with `object-position: bottom`. Four 56×56 tiles ride on top at the listed centres and angles, sliding ±28px along the rail, ±4px vertically, rotating ±3°, over 5.5 / 6.2 / 6.8 / 7.4s at different phases. Once `rails` is generated, re-measure the tile centres against the real groove ends and update `TILES`.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";

const TILES = [
  { src: "features/tile-bell.webp", cx: 349, cy: 450, rot: -12, period: 5.5, phase: 0 },
  { src: "features/tile-down.webp", cx: 149, cy: 510, rot: 10, period: 6.2, phase: -1.4 },
  { src: "features/tile-pool.webp", cx: 366, cy: 590, rot: -6, period: 6.8, phase: -2.7 },
  { src: "features/tile-up.webp", cx: 203, cy: 690, rot: 12, period: 7.4, phase: -0.6 },
];

export function RailTiles() {
  const reduced = useReducedMotion();
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-[320px] lg:h-[386px]">
        <Asset src="features/rails.webp" intrinsic={{ w: 1100, h: 780 }} className="object-cover object-bottom" />
      </div>
      {TILES.map((t) => (
        <motion.div
          key={t.src}
          className="absolute hidden lg:block"
          style={{ left: t.cx - 28, top: t.cy - 28, width: 56, height: 56 }}
          animate={reduced ? undefined : { x: [-28, 28, -28], y: [-4, 4, -4], rotate: [t.rot - 3, t.rot + 3, t.rot - 3] }}
          transition={reduced ? undefined : { duration: t.period, repeat: Infinity, ease: [0.65, 0, 0.35, 1], delay: t.phase }}
        >
          <Asset src={t.src} intrinsic={{ w: 180, h: 180 }} />
        </motion.div>
      ))}
    </>
  );
}
```

- [ ] **Step 2: Implement `Card2`**

Text at x 44, top near y 76, max-width 340, 20px `ink` with −0.01em tracking.

```tsx
import { RailTiles } from "./RailTiles";
import { COPY } from "@/lib/copy";

export function Card2() {
  return (
    <div className="bento-card min-h-[560px] p-11 lg:h-[736px]">
      <p
        className="relative z-10 max-w-[340px] text-ink"
        style={{ fontFamily: "var(--font-inter)", fontSize: 20, lineHeight: 1.4, letterSpacing: "-0.01em" }}
      >
        {COPY.features.card2.body}
      </p>
      <RailTiles />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: bento card 2 with tiles riding the rails

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 12: Card 3 and the orbit dots

**Files:**
- Create: `components/features/OrbitDots.tsx`
- Modify: `components/features/Card3.tsx`

**Interfaces:**
- Consumes: `COPY`.
- Produces: `<Card3 />`, `<OrbitDots />`.

- [ ] **Step 1: Implement `OrbitDots`**

Main §6.2 card 3 and §7.7. Four concentric 1px `line-soft` circles centred at 45% of the card width and 40px below its bottom edge, radii 130 / 190 / 250 / 310, clipped by the card. The three outer rings each carry a ⌀10 `blue` dot with a `0 0 0 4px rgba(10,104,245,.12)` halo, orbiting in 16 / 22 / 28s, linear, alternating direction.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

const RINGS = [130, 190, 250, 310];
const DOTS = [
  { r: 190, dur: 16, dir: 1 },
  { r: 250, dur: 22, dir: -1 },
  { r: 310, dur: 28, dir: 1 },
];

export function OrbitDots() {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute" style={{ left: "45%", top: "calc(100% + 40px)" }}>
        {RINGS.map((r) => (
          <span key={r} className="absolute rounded-full"
            style={{ left: -r, top: -r, width: r * 2, height: r * 2, border: "1px solid var(--color-line-soft)" }} />
        ))}
        {DOTS.map(({ r, dur, dir }) => (
          <motion.div
            key={r}
            className="absolute"
            style={{ left: 0, top: 0, width: 0, height: 0 }}
            animate={reduced ? undefined : { rotate: dir * 360 }}
            transition={reduced ? undefined : { duration: dur, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute rounded-full bg-blue"
              style={{ left: r - 5, top: -5, width: 10, height: 10, boxShadow: "0 0 0 4px rgba(10,104,245,.12)" }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `Card3`**

Text at x 36, y 36, max-width 300, Inter 500 18px `ink`. The button is now `Open the board` and navigates to `/app` (update §2), keeping the blue pill styling: 52px tall, `0 28px` padding, Inter 500 18px white, shadow `0 12px 30px rgba(10,104,245,.35)`, on the left at about 55% of the card height.

```tsx
import Link from "next/link";
import { OrbitDots } from "./OrbitDots";
import { COPY } from "@/lib/copy";

export function Card3() {
  return (
    <div className="bento-card min-h-[420px] p-9 lg:h-[470px]">
      <OrbitDots />
      <p
        className="relative z-10 max-w-[300px] text-ink"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18, lineHeight: 1.4 }}
      >
        {COPY.features.card3.body}
      </p>
      <Link
        href="/app"
        className="relative z-10 mt-8 inline-flex h-[52px] items-center rounded-full bg-blue px-7 text-white transition-colors duration-200 hover:bg-[#1F77F7] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue lg:absolute lg:top-[55%] lg:left-9 lg:mt-0"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18, boxShadow: "0 12px 30px rgba(10,104,245,.35)" }}
      >
        {COPY.features.card3.button}
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: bento card 3 with orbiting dots and the board link

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 13: Card 4 and the skeleton board

**Files:**
- Create: `components/features/SkeletonBoard.tsx`
- Modify: `components/features/Card4.tsx`

**Interfaces:**
- Consumes: `Asset`, `Mark`, `COPY`.
- Produces: `<Card4 />`, `<SkeletonBoard />`.

- [ ] **Step 1: Implement `SkeletonBoard`**

Main §6.2 card 4. White card 420×150, radius 16, shadow `0 20px 40px rgba(1,3,32,.06)`, three rows each with a ⌀28 `#EEF1F6` circle, a 14px ticker and `#EEF1F6` bars 120×10 and 60×10. The whole board is `blur(1.5px)` at `opacity: .7`; a duplicate sits 14px higher at `opacity: .4`. A ⌀112 `sphere-dark` with a 42px white mark sits over the centre.

```tsx
import { Asset } from "@/components/ui/Asset";
import { Mark } from "@/components/ui/Mark";

const TICKERS = ["HIMS", "NVDA", "TSLA"];

function Board({ dim }: { dim?: boolean }) {
  return (
    <div
      className="absolute left-1/2 w-[420px] max-w-full -translate-x-1/2 rounded-2xl bg-white p-4"
      style={{
        top: dim ? -14 : 0, height: 150,
        boxShadow: "0 20px 40px rgba(1,3,32,.06)",
        filter: "blur(1.5px)", opacity: dim ? 0.4 : 0.7,
      }}
      aria-hidden="true"
    >
      {TICKERS.map((t) => (
        <div key={t} className="flex items-center gap-3 py-[7px]">
          <span className="h-7 w-7 shrink-0 rounded-full bg-[#EEF1F6]" />
          <span className="tabular text-ink" style={{ fontFamily: "var(--font-inter)", fontSize: 14 }}>{t}</span>
          <span className="ml-auto h-[10px] w-[120px] rounded-full bg-[#EEF1F6]" />
          <span className="h-[10px] w-[60px] rounded-full bg-[#EEF1F6]" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBoard() {
  return (
    <div className="relative mx-auto h-[164px] w-full max-w-[420px]">
      <Board dim />
      <Board />
      <div className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2">
        <Asset src="features/sphere-dark.webp" intrinsic={{ w: 260, h: 260 }} />
        <span className="absolute inset-0 flex items-center justify-center text-white">
          <Mark height={42} />
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `Card4`**

```tsx
import { SkeletonBoard } from "./SkeletonBoard";
import { COPY } from "@/lib/copy";

export function Card4() {
  return (
    <div className="bento-card min-h-[460px] p-9 lg:h-[470px]">
      <SkeletonBoard />
      <h3
        className="mt-8 text-ink"
        style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: "clamp(30px, 4.5vw, 48px)", lineHeight: 1.1 }}
      >
        {COPY.features.card4.h3}
      </h3>
      <p className="mt-3 max-w-[520px] text-body" style={{ fontFamily: "var(--font-inter)", fontSize: 18, lineHeight: 1.4 }}>
        {COPY.features.card4.body}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Run the harness and commit**

```bash
npm run accept
git add -A
git commit -m "feat: bento card 4 with the blurred skeleton board

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 14: Solution and the blue section shell

**Files:**
- Create: `components/sections/BlueSection.tsx`, `components/sections/Solution.tsx`
- Modify: `app/globals.css`, `app/page.tsx`

**Interfaces:**
- Consumes: `AssetBox`, `Badge`, `BlurWords`, `Reveal`, `COPY`, `u`.
- Produces: `<BlueSection>{children}</BlueSection>` carrying `[data-testid="blue-section"]` and the `--u` artboard context; `<Solution />`.

- [ ] **Step 1: Add the blue background to `app/globals.css`**

```css
.blue-section {
  background:
    radial-gradient(ellipse 780px 540px at 50% 260px, rgba(255,255,255,.10), rgba(255,255,255,0) 70%),
    #0A68F5;
  border-radius: 64px 64px 0 0;
}
.blue-grain { opacity: .20; }
```

- [ ] **Step 2: Implement `BlueSection`**

```tsx
export function BlueSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="artboard-wrap" data-testid="blue-section">
      <div className="artboard blue-section overflow-hidden">
        <div className="grain blue-grain" />
        <div className="relative">{children}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Implement `Solution`**

Main §6.3 coordinates, measured from the top of the blue section. `bell` (860, 0) 66×60. `toggle` (830, 40) 280×155. `cursor` (778, 122) 70×83. Badge centred at y 262. H2 centred, cap top y 352, max-width 1110, `text-wrap: balance`, no manual breaks. Left column right edge 766, y 680, width 360. `tray-coin` (803, 670) 298×210. Right column right edge 1503, y 668, width 360. Both columns right-aligned, 20px white. Idle from §7.8.

```tsx
import { AssetBox } from "@/components/ui/AssetBox";
import { Badge } from "@/components/ui/Badge";
import { BlurWords } from "@/components/ui/BlurWords";
import { Reveal } from "@/components/ui/Reveal";
import { COPY } from "@/lib/copy";
import { u } from "@/lib/u";

export function Solution() {
  return (
    <div className="relative" style={{ height: u(900) }}>
      <AssetBox src="solution/toggle.webp" x={830} y={40} w={280} h={155} z={2}
        intrinsic={{ w: 700, h: 400 }} float={{ y: 5, period: 7 }} />
      <AssetBox src="solution/bell.webp" x={860} y={0} w={66} h={60} z={3}
        intrinsic={{ w: 200, h: 200 }} float={{ y: 8, period: 3.8 }} />
      <AssetBox src="solution/cursor.webp" x={778} y={122} w={70} h={83} z={3}
        intrinsic={{ w: 200, h: 240 }} float={{ y: 4, period: 2.6 }} />
      <AssetBox src="solution/tray-coin.webp" x={803} y={670} w={298} h={210} z={2}
        intrinsic={{ w: 700, h: 500 }} float={{ y: 6, period: 5.2 }} />

      <Reveal className="absolute left-1/2 -translate-x-1/2" style={{ top: u(262) }}>
        <Badge variant="glass" text={COPY.solution.badge} />
      </Reveal>

      <BlurWords
        as="h2"
        text={COPY.solution.h2}
        className="absolute left-1/2 -translate-x-1/2 text-center text-white"
        style={{
          top: u(352), width: u(1110),
          fontFamily: "var(--font-jakarta)", fontWeight: 500,
          fontSize: "clamp(30px, 5vw, 56px)", lineHeight: 1.2, textWrap: "balance",
        }}
      />

      <Reveal className="absolute text-right text-white"
        style={{ left: u(406), top: u(680), width: u(360), fontFamily: "var(--font-inter)", fontSize: 20, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
        {COPY.solution.left}
      </Reveal>
      <Reveal className="absolute text-right text-white"
        style={{ left: u(1143), top: u(668), width: u(360), fontFamily: "var(--font-inter)", fontSize: 20, lineHeight: 1.4, letterSpacing: "-0.01em" }}>
        {COPY.solution.right}
      </Reveal>
    </div>
  );
}
```

- [ ] **Step 4: Run the harness and commit**

```bash
npm run accept
git add -A
git commit -m "feat: blue section shell and the solution block

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 15: Showcase slider

**Files:**
- Create: `components/sections/Showcase.tsx`, `components/showcase/FeatureSlider.tsx`, `components/showcase/SlideSide.tsx`, `components/showcase/SlidePool.tsx`, `components/showcase/SlideSettle.tsx`

**Interfaces:**
- Consumes: `Asset`, `COPY`, lucide icons `ArrowUpDown`, `Layers`, `ReceiptText`.
- Produces: `<Showcase />` carrying `[data-testid="showcase-card"]`.

- [ ] **Step 1: Implement the three slides**

Main §6.4. Slide 1: three concentric rings ⌀280/420/560 at 1.5px `rgba(255,255,255,.28)`, centred, outer clipped; ⌀260 `orb` centred over a `radial-gradient(circle, rgba(164,140,254,.35), transparent 65%)` glow pulsing `.6 ↔ 1` over 3s. Slide 2: `stack` 520×420 pinned to the bottom centre, ⌀64 `icon-up` on the front card, then the pool title and subtitle, a 32px grid of 1px `rgba(255,255,255,.06)` lines behind the top masked downward, stack floating ±4px. Slide 3: `receipts` full width pinned to the top, a 1px `rgba(255,255,255,.18)` rounded connector below it, and the glowing `Settled` pill 120px from the bottom, built in code.

```tsx
// components/showcase/SlideSide.tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";

export function SlideSide() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 grid place-items-center">
      {[280, 420, 560].map((d) => (
        <span key={d} className="absolute rounded-full"
          style={{ width: d, height: d, border: "1.5px solid rgba(255,255,255,.28)" }} />
      ))}
      <motion.span
        className="absolute"
        style={{ width: 420, height: 420, background: "radial-gradient(circle, rgba(164,140,254,.35), transparent 65%)" }}
        animate={reduced ? undefined : { opacity: [0.6, 1, 0.6] }}
        transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      />
      <div className="relative h-[260px] w-[260px]">
        <Asset src="showcase/orb.webp" intrinsic={{ w: 600, h: 600 }} />
      </div>
    </div>
  );
}
```

```tsx
// components/showcase/SlidePool.tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";
import { COPY } from "@/lib/copy";

export function SlidePool() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(#000, transparent)",
          WebkitMaskImage: "linear-gradient(#000, transparent)",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[420px] w-[520px] -translate-x-1/2"
        animate={reduced ? undefined : { y: [-4, 4, -4] }}
        transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      >
        <Asset src="showcase/stack.webp" intrinsic={{ w: 1100, h: 900 }} />
        <div className="absolute inset-x-0 top-[120px] flex flex-col items-center gap-3 text-center">
          <div className="h-16 w-16"><Asset src="showcase/icon-up.webp" intrinsic={{ w: 180, h: 180 }} /></div>
          <p className="text-white" style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 28 }}>
            {COPY.showcase.slide2.title}
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "rgba(255,255,255,.7)" }}>
            {COPY.showcase.slide2.sub}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
```

```tsx
// components/showcase/SlideSettle.tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";
import { COPY } from "@/lib/copy";

export function SlideSettle() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 top-0 h-[300px]"
        animate={reduced ? undefined : { y: [-4, 4, -4] }}
        transition={reduced ? undefined : { duration: 4.5, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      >
        <Asset src="showcase/receipts.webp" intrinsic={{ w: 1300, h: 650 }} />
      </motion.div>
      <span className="absolute left-1/2 -translate-x-1/2 rounded-2xl"
        style={{ top: 300, width: 220, height: 110, border: "1px solid rgba(255,255,255,.18)" }} aria-hidden="true" />
      <span
        className="absolute left-1/2 flex h-[52px] -translate-x-1/2 items-center rounded-full px-8 text-white"
        style={{
          bottom: 120,
          background: "linear-gradient(180deg, #5BB0FF, #1E6FF5)",
          border: "1px solid rgba(255,255,255,.5)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 0 40px rgba(46,132,255,.6)",
          fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 20,
        }}
      >
        {COPY.showcase.slide3.pill}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Implement `FeatureSlider`**

Main §6.4 and §7.9. Card padding 22, list panel left, dark panel 639px right, gap 24. List panel radius 24, `rgba(255,255,255,.04)` fill, 1px `rgba(255,255,255,.16)` border, padding `40px 44px`, groups 36px apart. Active group opacity 1, others .45, hover .8. Dark panel `panel` fill, radius 24, `overflow: hidden`, slides absolutely stacked. Three 64×3 progress bars 30px from the bottom, 14px apart, track `rgba(255,255,255,.22)`, fill white. Autoplay 4s starting at 40% in view, paused off-screen. Transition 0.7s ease-in-out: incoming rises from `y: 100%`, outgoing leaves to `y: -18%` with opacity 1→0 and scale 1→.96. Clicking a group or a bar jumps and restarts the timer.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpDown, Layers, ReceiptText } from "lucide-react";
import { COPY } from "@/lib/copy";
import { SlideSide } from "./SlideSide";
import { SlidePool } from "./SlidePool";
import { SlideSettle } from "./SlideSettle";

const ICONS = [ArrowUpDown, Layers, ReceiptText];
const SLIDES = [SlideSide, SlidePool, SlideSettle];
const DURATION = 4000;

export function FeatureSlider() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !running) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(id);
  }, [active, running, reduced]);

  const Slide = SLIDES[active];

  return (
    <div
      ref={ref}
      data-testid="showcase-card"
      className="rounded-[32px] p-[22px]"
      style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_639px]">
        <div className="rounded-3xl px-11 py-10"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.16)" }}>
          {COPY.showcase.groups.map((group, i) => {
            const Icon = ICONS[i];
            return (
              <button
                key={group.title}
                type="button"
                aria-controls="showcase-panel"
                aria-expanded={active === i}
                onClick={() => setActive(i)}
                className="block w-full text-left transition-opacity duration-300 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
                style={{ opacity: active === i ? 1 : 0.45, marginTop: i === 0 ? 0 : 36 }}
              >
                <span className="flex items-center gap-3 text-white">
                  <Icon size={20} aria-hidden="true" />
                  <span style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}>
                    {group.title}
                  </span>
                </span>
                <ul className="mt-3">
                  {group.bullets.map(([lead, rest]) => (
                    <li key={lead} className="relative pl-[18px] text-white"
                      style={{ fontFamily: "var(--font-inter)", fontSize: 15, lineHeight: 1.5 }}>
                      <span className="absolute left-0 top-[9px] h-1 w-1 rounded-full bg-white" />
                      <strong style={{ fontWeight: 600 }}>{lead}</strong> {rest}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div id="showcase-panel" aria-live="off"
          className="relative h-[440px] overflow-hidden rounded-3xl lg:h-[632px]" style={{ background: "#000320" }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={reduced ? { opacity: 0 } : { y: "100%" }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: "-18%", opacity: 0, scale: 0.96 }}
              transition={{ duration: reduced ? 0.2 : 0.7, ease: [0.65, 0, 0.35, 1] }}
            >
              <Slide />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-[30px] left-1/2 flex -translate-x-1/2 gap-[14px]">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show ${COPY.showcase.groups[i].title}`}
                onClick={() => setActive(i)}
                className="h-[3px] w-16 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,.22)" }}
              >
                <motion.span
                  className="block h-full bg-white"
                  initial={{ width: i < active ? "100%" : "0%" }}
                  animate={{ width: i <= active ? "100%" : "0%" }}
                  transition={{ duration: i === active && !reduced && running ? DURATION / 1000 : 0, ease: "linear" }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement `Showcase`**

```tsx
import { FeatureSlider } from "@/components/showcase/FeatureSlider";

export function Showcase() {
  return (
    <div className="container-recess pt-[110px]">
      <FeatureSlider />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: showcase slider with three slides, autoplay and progress bars

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 16: CTA, footer and the legal stub pages

**Files:**
- Create: `components/sections/Cta.tsx`, `components/sections/Footer.tsx`, `app/terms/page.tsx`, `app/risk/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `AssetBox`, `BlurWords`, `Reveal`, `LaunchPill`, `Mark`, `COPY`, `u`.
- Produces: `<Cta />`, `<Footer />`; the CTA pill carries `id="waitlist"` no longer — it carries `id="board"`.

- [ ] **Step 1: Implement `Cta`**

Main §6.5, y measured from the bottom of the slider card. App icon centred at y 218, 96×96, radius 24, vertical `teal-top` → `teal-bottom` gradient, 46px white mark, shadow `0 14px 30px rgba(0,20,80,.25)`. H2 cap top y 377, 64px. Lead y 468, 18px `on-blue-80`, now reading `The board opens at every Friday close.` Pill y 533. `coin-meta` (40, 263) 355×347. `coin-tsla` (1380, 555) ⌀405, clipped by the section bottom. `chip-up` (325, 592) 62×56. `chip-bell` (1555, 482) 52×50. Dots ⌀12 at (400, 550) and ⌀8 at (1536, 453). Entrances per §7.10.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { AssetBox } from "@/components/ui/AssetBox";
import { BlurWords } from "@/components/ui/BlurWords";
import { Reveal } from "@/components/ui/Reveal";
import { LaunchPill } from "@/components/ui/LaunchPill";
import { Mark } from "@/components/ui/Mark";
import { COPY } from "@/lib/copy";
import { u } from "@/lib/u";

export function Cta() {
  const reduced = useReducedMotion();
  return (
    <div className="relative overflow-hidden" style={{ height: u(830) }}>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, x: -80 }}
        whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reduced ? 0.2 : 1.1, delay: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <AssetBox src="hero/coin-meta.webp" x={40} y={263} w={355} h={347} z={1}
          intrinsic={{ w: 900, h: 900 }} float={{ y: 8, rotate: 1, period: 7.8, phase: -0.9 }} />
      </motion.div>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 100 }}
        whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reduced ? 0.2 : 1.1, delay: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <AssetBox src="hero/coin-tsla.webp" x={1380} y={555} w={405} h={405} z={1}
          intrinsic={{ w: 900, h: 900 }} float={{ y: 8, rotate: 1, period: 6.8, phase: -3.1 }} />
      </motion.div>
      <AssetBox src="hero/chip-up.webp" x={325} y={592} w={62} h={56} z={2}
        intrinsic={{ w: 300, h: 250 }} float={{ y: 6, period: 4.8 }} />
      <AssetBox src="hero/chip-bell.webp" x={1555} y={482} w={52} h={50} z={2}
        intrinsic={{ w: 200, h: 200 }} float={{ y: 6, period: 5.2 }} />

      {([[400, 550, 12], [1536, 453, 8]] as const).map(([x, y, d]) => (
        <span key={x} className="absolute rounded-full bg-white"
          style={{ left: u(x), top: u(y), width: u(d), height: u(d), boxShadow: "0 0 12px rgba(255,255,255,.8)" }} />
      ))}

      <div className="absolute inset-x-0 flex flex-col items-center px-6 text-center" style={{ top: u(218), zIndex: 3 }}>
        <motion.div
          className="flex h-24 w-24 items-center justify-center rounded-3xl text-white"
          style={{ background: "linear-gradient(180deg, #26FADE, #0EE8CC)", boxShadow: "0 14px 30px rgba(0,20,80,.25)" }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0.2 : 0.6 }}
        >
          <Mark height={46} />
        </motion.div>

        <BlurWords as="h2" text={COPY.cta.h2} delay={0.15} className="mt-[63px] text-white"
          style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1.1 }} />

        <Reveal delay={0.6}>
          <p className="mt-6" style={{ fontFamily: "var(--font-inter)", fontSize: 18, color: "rgba(255,255,255,.80)" }}>
            {COPY.cta.lead}
          </p>
        </Reveal>
        <Reveal delay={0.6} className="mt-8 flex justify-center">
          <LaunchPill variant="cta" id="board" />
        </Reveal>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `Footer`**

Main §6.5 plus update §2: the footer gains `Terms` and `Risk` links. Copyright at x 300 y 773, 16px. Four ⌀50 social circles, 1px `rgba(255,255,255,.22)` border, 20px white icons, 72px between centres. The second line is 13px at 60% white. Social links stay `#` placeholders until update §10 supplies them.

```tsx
import Link from "next/link";
import { Twitter, Send, Github, BookOpen } from "lucide-react";
import { COPY } from "@/lib/copy";

const SOCIALS = [
  { Icon: Twitter, label: "X" },
  { Icon: Send, label: "Telegram" },
  { Icon: Github, label: "GitHub" },
  { Icon: BookOpen, label: "Docs" },
];

export function Footer() {
  return (
    <footer className="container-recess flex flex-col items-center gap-6 pb-[17px] text-white md:flex-row md:justify-between">
      <div className="order-2 text-center md:order-1 md:text-left">
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 16, lineHeight: 1.4 }}>{COPY.footer.copyright}</p>
        <p className="mt-1" style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "rgba(255,255,255,.6)" }}>
          {COPY.footer.disclaimer}
        </p>
        <p className="mt-2 flex justify-center gap-4 md:justify-start"
          style={{ fontFamily: "var(--font-inter)", fontSize: 13 }}>
          <Link href="/terms" className="underline underline-offset-4">{COPY.footer.terms}</Link>
          <Link href="/risk" className="underline underline-offset-4">{COPY.footer.risk}</Link>
        </p>
      </div>
      <ul className="order-1 flex gap-[22px] md:order-2">
        {SOCIALS.map(({ Icon, label }) => (
          <li key={label}>
            <a href="#" aria-label={label}
              className="flex h-[50px] w-[50px] items-center justify-center rounded-full transition-colors duration-200 hover:bg-[rgba(255,255,255,.1)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
              style={{ border: "1px solid rgba(255,255,255,.22)" }}>
              <Icon size={20} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
```

- [ ] **Step 3: Write the legal stubs**

Update §8: both pages are placeholders and say so plainly.

```tsx
// app/terms/page.tsx
export const metadata = { title: "Terms — Recess" };

export default function TermsPage() {
  return (
    <main className="container-recess py-24">
      <h1 className="text-ink" style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 48, lineHeight: 1.1 }}>
        Terms of Service
      </h1>
      <p className="mt-6 max-w-[640px] text-body" style={{ fontFamily: "var(--font-inter)", fontSize: 18, lineHeight: 1.4 }}>
        This page is a placeholder. The terms are being prepared by counsel and will be published here before launch.
      </p>
    </main>
  );
}
```

`app/risk/page.tsx` is the same shape with the heading `Risk Disclosure` and a matching placeholder sentence.

- [ ] **Step 4: Compose the whole landing**

```tsx
import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { BlueSection } from "@/components/sections/BlueSection";
import { Solution } from "@/components/sections/Solution";
import { Showcase } from "@/components/sections/Showcase";
import { Cta } from "@/components/sections/Cta";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <BlueSection>
        <Solution />
        <Showcase />
        <Cta />
        <Footer />
      </BlueSection>
    </main>
  );
}
```

- [ ] **Step 5: Run the full harness and commit**

```bash
npm run accept
git add -A
git commit -m "feat: CTA block, footer with legal links, and the terms and risk stubs

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 17: Responsive behaviour

**Files:**
- Modify: `components/sections/Hero.tsx`, `components/sections/Solution.tsx`, `components/showcase/FeatureSlider.tsx`, `components/sections/Cta.tsx`, `components/ui/LaunchPill.tsx`, `app/globals.css`
- Create: `tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Write the failing responsive test**

```ts
import { test, expect } from "@playwright/test";

for (const [name, width, height] of [["phone", 390, 844], ["tablet", 834, 1194]] as const) {
  test(`${name} has no sideways scroll`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.waitForTimeout(1200);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test(`${name} keeps the illustration clear of the headline`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.waitForTimeout(1200);
    const h1 = await page.locator("h1").boundingBox();
    const ribbon = await page.locator('[data-asset="hero/ribbon.webp"]').boundingBox();
    if (!h1 || !ribbon) throw new Error("missing boxes");
    expect(ribbon.y + ribbon.height).toBeLessThanOrEqual(h1.y + 8);
  });
}
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx playwright test tests/e2e/responsive.spec.ts`
Expected: FAIL, the desktop artboard overflows at 390px.

- [ ] **Step 3: Implement the mobile hero**

Main §9. Below 768 the hero height follows content. Lockup at top 24. Illustration block 100vw × 72vw: `ribbon` 180vw wide and centred; `coin-nvda` left 18vw top 10vw width 30vw; `coin-aapl` left 48vw top 2vw width 24vw; `coin-meta` left 68vw top 12vw width 26vw behind the ribbon; `chip-up` left 8vw top 34vw width 12vw. `coin-tsla`, the other chips and the strokes are hidden. H1 44px. The pill goes full width capped at 460, height 54, with the countdown half at 60% and the action half at 40%.

- [ ] **Step 4: Implement the remaining breakpoints**

Main §9. Under 1024 the bento stacks with minimum heights 620 / 560 (rails 320) / 420 / 460, and under 480 the circle pill scales to .8. Under 1024 the toggle group scales to .7 and the Solution columns stack as text, `tray-coin`, text, centred at max-width 480. Under 1024 the slider stacks: list first with every group visible and clickable, then the dark panel at 440 tall. Under 768 the CTA coins render at 50% and hang off the edges, left at `-40px` and right at `-60px`, with the chips hidden; the footer puts socials on top and the copyright below, all centred.

- [ ] **Step 5: Run the responsive suite and watch it pass**

Run: `npx playwright test tests/e2e/responsive.spec.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: responsive layouts for phone, tablet and small desktop

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 18: Accessibility, SEO and performance pass

**Files:**
- Modify: `app/layout.tsx`, `components/**`
- Create: `docs/performance-notes.md`

- [ ] **Step 1: Audit heading order and landmarks**

Exactly one `h1` on the landing, section headings are `h2`, card headings are `h3`. Slider groups are `button` with `aria-controls`; the slide panel has `aria-live="off"`.

- [ ] **Step 2: Audit images**

Every decorative image has `alt=""` and `aria-hidden`. Hero images are `priority`, everything else lazy. Every image declares `width` and `height`.

- [ ] **Step 3: Record the contrast decision**

Main §11: the CTA lead at 80% white gives about 3.7:1, matching the reference but below AA for 18px. Ship 80% to match, and note in `docs/performance-notes.md` that raising it to 100% white reaches about 4.9:1 if AA becomes a requirement.

- [ ] **Step 4: Run Lighthouse and record the numbers**

Run: `npm run build && npm start`, then Lighthouse against `http://localhost:3000`.
Expected: Performance ≥90, Accessibility ≥95 apart from the recorded CTA lead contrast item.

**Known risk.** The wallet stack is global by the user's decision, so RainbowKit, wagmi and viem load on the landing. If Performance falls below 90, record the measured number in `docs/performance-notes.md` and report it rather than silently removing the wallet. The remedy to propose, not to apply unasked, is replacing the RainbowKit modal with a lightweight in-house connect sheet built in the site's own design language.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: accessibility, SEO and performance pass

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 19: Asset prompt pack and final acceptance

**Files:**
- Create: `docs/asset-prompts.md`, `README.md`

- [ ] **Step 1: Write `docs/asset-prompts.md`**

Copy the main brief §8.3 style block and all 26 prompts from §8.4 verbatim, each under a heading naming its target file, export size and background from the §8.2 table. Put the §8.1 workflow at the top: generate in a tool that supports transparency, cut out with `rembg` otherwise, check edges on white and on `#0A68F5`, no floor shadows, verify ticker letters, generate the dark-panel assets straight onto `#000320` and `rails` onto white without cutting out, export WebP with alpha at quality 90 and twice display size, and generate all coins in one session.

- [ ] **Step 2: Write `README.md`**

Cover: install, `npm run dev`, the placeholder-to-asset workflow (drop files into `public/images/<group>/`, restart dev, the manifest regenerates through `predev`), `npm test`, `npm run test:e2e`, `npm run accept`, every variable in `.env.example`, and the fact that the project has no backend by design.

- [ ] **Step 3: Run everything**

```bash
npm test
npm run test:e2e
npm run build
npm run accept
```
Expected: unit and E2E suites pass, build succeeds, four overlays written.

- [ ] **Step 4: Verify the no-backend rule mechanically**

```bash
test ! -d app/api && echo "no api routes"
find . -name "*.sol" -not -path "./node_modules/*" | wc -l   # expect 0
grep -rn "use server" app components lib | wc -l              # expect 0
```

- [ ] **Step 5: Walk the acceptance list**

Check main §12 items 1–7, skipping the form checks that update §1 removed, then update §9's landing item: no mention of waitlist survives anywhere. Record each result. Anything that cannot be verified until real assets exist is listed as pending rather than passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: asset generation prompts, README and final acceptance run

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage.** Main §1 copy rules are enforced by the guard test in Task 4. §2 graphics rule shapes the asset slot design in Task 5 and every card. §3 stack and structure map to the File Structure table. §4 tokens, type, grid, radii and grain land in Task 1. §5 mark in Task 2. §6.1 hero in Task 7, §6.2 features in Tasks 9–13, §6.3 solution in Task 14, §6.4 showcase in Task 15, §6.5 CTA and footer in Task 16. §7 animation is split across the primitives in Task 5 and each section's own task. §8 assets are the placeholder pipeline in Tasks 1 and 5 with the prompt pack in Task 19. §9 responsive is Task 17. §11 accessibility, SEO and speed is Task 18. §12 acceptance is Task 8 for the harness and Task 19 for the walkthrough. Main §10 is void by update §1.

Corrective brief coverage. The no-backend rule is a global constraint and is checked mechanically in Task 19 Step 4. §1 removals never get built. §2 landing changes: the pill is Task 6, the hero mount is Task 7, card 3's button is Task 12, the CTA lead and footer links are Task 16. §3.2 schedule and §3.4 void rules are Task 3 and `lib/recess/config.ts`. §5 wallet stack and env-only network config are Task 6. §7 design language and tabular numerals are Task 1. §8 legal stubs are Task 16, with the first-entry modal belonging to the app plan. §10 open questions live as marked placeholders in `lib/recess/config.ts` and `lib/recess/schedule.ts`.

**Deferred to the app plan.** Update §3.1, §3.3, §4, §5's action-button state table, §6's data layer, §7's app-specific design and §8's entry modal are all built in `2026-09-10-recess-app.md`. This plan creates `lib/recess/config.ts` and `lib/recess/schedule.ts` because the landing countdown needs them, and the app plan extends the same directory.

**Known deviations, all recorded.** The grain texture is generated in Node rather than Python because PIL is unavailable here. The reference screenshots are 1568 wide, so overlay tolerance is softer than ±4px. The reference files stay in WebP rather than being converted to PNG. The wallet stack loads on the landing by explicit decision, with the performance risk recorded in Task 18.

**Type consistency.** `Asset` takes `intrinsic: {w, h}` everywhere. `AssetBox` takes `x, y, w, h, z, intrinsic, float`. `Float` takes `y, rotate, period, phase`. `BlurWords` takes `as, text, delay`. `Reveal` takes `delay, stagger`. `LaunchPill` takes `variant, id`. `epochAt` returns `{ id, label, openTime, lockTime, status }` and every consumer reads those five fields.
