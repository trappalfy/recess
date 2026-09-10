# Recess Trading App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Recess trading app at `/app` as a complete mainnet-shaped frontend, driven entirely by a client-side adapter so that demo data today and contracts later require no UI rewrite.

**Architecture:** Every screen talks to one interface, `RecessClient`, and never to a chain or a network directly. `MockClient` answers it with deterministic demo data and simulated transactions; `ChainClient` is an empty shell with TODOs for the contract stage. The mode is chosen by env, falling back to mock whenever a markets address is absent. All pool arithmetic lives in pure functions with unit tests, so the numbers on screen are verified independently of React. There is no backend, no contract, and no server-side state.

**Tech Stack:** Next.js 16.3.4 (App Router) · React 19.3.0 · TypeScript · Tailwind CSS 4.3.3 · motion 13.2.0 · lucide-react 1.44.0 · wagmi + viem + RainbowKit · Vitest 5.0.0 · Playwright 1.63.0

**Spec:** `recess-brief-update-01.md`, with `recess-site-brief.md` supplying the design language. The corrective brief takes priority wherever the two disagree.

**Prerequisite plan:** `docs/superpowers/plans/2026-09-10-recess-landing.md` must be complete through Task 6. It creates `lib/recess/config.ts`, `lib/recess/schedule.ts`, `lib/wallet/*`, `app/providers.tsx` and the shared UI primitives this plan builds on.

## Global Constraints

- **No backend (update §preamble).** Do not create smart contracts, `.sol` files, Hardhat, Foundry, deploy scripts, API routes under `app/api`, data-writing server actions, databases, ORMs, migrations, indexers, subgraphs, crons, workers, queues, server sessions, or RPC and price proxies. If a task looks impossible without a backend, stop and ask instead of building one.
- **The draft contract interface in update §6 is documentation, not a deliverable.** It becomes TypeScript types and an ABI constant in `lib/recess/abi.ts`. No Solidity file is created.
- **Demo honesty (update §6).** While the mode is `mock`, a `Demo data` badge is always visible in the app header. Demo figures must never be mistaken for real ones.
- **Mainnet only (update §preamble).** Default network config is Robinhood Chain mainnet from env. No testnet faucet, no testnet banner.
- **Env only (update §5).** Chain id, RPC, explorer and the USDG address come from env. Nothing is hardcoded.
- **Copy rules (main §1) still apply.** No yield promises, no APY / earn / profit, no invented claims. Demo numbers are allowed only behind the `Demo data` badge, never on the landing.
- **Design language (update §7).** White background, cards at radius 32 with a `line` border, Jakarta 500 headings, Inter body, `font-variant-numeric: tabular-nums` on every figure, dark `ink` pill as the primary button, `blue` for the active side. Above is `#0EE8CC`, Below is `#A48CFE`. Toasts and modals reuse the same radius and border. Animation responds to actions only: no scroll-triggered entrances anywhere in the app.
- **Estimates are labelled (update §3.3).** Every multiplier shown before lock carries an `est.` label, because it moves with each new stake.
- **Placeholders (update §10).** `feeBps`, the ticker list, the lock time, the void window, the minimum stake, the legal texts and the social links are unresolved. They live as marked constants in `lib/recess/config.ts` and must not be scattered through components.

---

## File Structure

| Path | Responsibility |
|---|---|
| `lib/recess/types.ts` | `Side`, `MarketStatus`, `Market`, `Position`, `Activity`, `TxResult` |
| `lib/recess/math.ts` | Pure pool arithmetic: multipliers, payouts, side share |
| `lib/recess/client.ts` | `RecessClient` interface plus `getClient()` mode switch |
| `lib/recess/mock.ts` | Deterministic demo data, 1.5s simulated transactions, epoch fast-forward |
| `lib/recess/chain.ts` | Empty `ChainClient` with TODOs |
| `lib/recess/abi.ts` | Draft ABI as a TypeScript constant, plus matching types |
| `lib/recess/format.ts` | USDG, price and percentage formatting |
| `lib/recess/action-state.ts` | Pure resolver for the stake button state machine |
| `app/app/layout.tsx` | App shell: header, epoch bar, legal gate |
| `app/app/page.tsx` | Board |
| `app/app/[ticker]/page.tsx` | Single market |
| `app/app/portfolio/page.tsx` | Positions in three tabs |
| `components/app/AppHeader.tsx` | Lockup, nav, connect button, balance, `Demo data` badge |
| `components/app/EpochBar.tsx` | Epoch label, status, countdown |
| `components/app/LegalGate.tsx` | First-entry confirmation modal |
| `components/app/MarketTable.tsx` | Board table, cards below 768 |
| `components/app/SideBar.tsx` | Above / Below ratio bar |
| `components/app/StakePanel.tsx` | Side toggle, amount, estimate, action button |
| `components/app/EpochTimeline.tsx` | Friday close → Locked → Settled |
| `components/app/ActivityFeed.tsx` | Recent stakes |
| `components/app/RulesBlock.tsx` | Settlement source and void cases |
| `components/app/Toast.tsx` | Toast host and hook |
| `components/app/DevEpochControls.tsx` | Mock-only epoch fast-forward |
| `tests/unit/*.test.ts` | Vitest |
| `tests/e2e/app.spec.ts` | Playwright end-to-end flow |

---

### Task 1: Types, pool arithmetic and formatting

Pure functions first: the numbers on every screen come from here, so they are verified before any component exists.

**Files:**
- Create: `lib/recess/types.ts`, `lib/recess/math.ts`, `lib/recess/format.ts`, `tests/unit/math.test.ts`, `tests/unit/format.test.ts`

**Interfaces:**
- Consumes: `RECESS_CONFIG` from `lib/recess/config`.
- Produces: the types below; `sideShare(poolAbove, poolBelow, side): number`; `estimateMultiplier(poolAbove, poolBelow, side, feeBps): number | null`; `estimatePayout(stake, poolAbove, poolBelow, side, feeBps): bigint | null`; `formatUsdg(v: bigint): string`; `formatPrice(v: number): string`; `formatPercent(v: number): string`.

- [ ] **Step 1: Write `lib/recess/types.ts`**

Field names mirror the draft contract interface in update §6, so the chain adapter maps one to one.

```ts
export type Side = "Above" | "Below";
export type MarketStatus = "Open" | "Locked" | "Settled" | "Void";

export type Market = {
  /** `${epochId}:${ticker}` */
  id: string;
  epochId: string;
  ticker: string;
  /** Reference price at the Friday close. */
  fridayClose: number;
  /** Current token price in the DEX pool. Informational only (update §3.1). */
  poolPrice: number;
  /** USDG in base units. */
  poolAbove: bigint;
  poolBelow: bigint;
  status: MarketStatus;
  /** First fresh reference print after the weekend, once settled. */
  settlePrice: number | null;
  winner: Side | null;
  openTime: number;
  lockTime: number;
};

export type Position = {
  marketId: string;
  ticker: string;
  above: bigint;
  below: bigint;
  claimed: boolean;
  status: MarketStatus;
  winner: Side | null;
  /** Payout once settled, or the refund amount when void. */
  payout: bigint | null;
};

export type Activity = {
  id: string;
  marketId: string;
  user: `0x${string}`;
  side: Side;
  amount: bigint;
  at: number;
};

export type TxResult = { hash: `0x${string}` };
```

- [ ] **Step 2: Write the failing arithmetic test**

Update §3.3 gives both formulas. `feeBps` is applied to the whole pool before the winning side splits it.

`tests/unit/math.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sideShare, estimateMultiplier, estimatePayout } from "../../lib/recess/math";

const U = (n: number) => BigInt(n) * 1_000_000n; // 6-decimal USDG

describe("sideShare", () => {
  it("splits an even pool down the middle", () => {
    expect(sideShare(U(50), U(50), "Above")).toBeCloseTo(0.5, 6);
  });
  it("reports the whole pool when one side is empty", () => {
    expect(sideShare(U(80), 0n, "Above")).toBeCloseTo(1, 6);
  });
  it("returns a half when the market is empty, so the bar renders", () => {
    expect(sideShare(0n, 0n, "Above")).toBeCloseTo(0.5, 6);
  });
});

describe("estimateMultiplier", () => {
  it("applies the fee to the whole pool", () => {
    // total 100, fee 2%, Above holds 25 => 98 / 25 = 3.92
    expect(estimateMultiplier(U(25), U(75), "Above", 200)).toBeCloseTo(3.92, 6);
  });
  it("is just under one when a side holds the whole pool", () => {
    expect(estimateMultiplier(U(100), 0n, "Above", 200)).toBeCloseTo(0.98, 6);
  });
  it("has no value when the side is empty", () => {
    expect(estimateMultiplier(0n, U(100), "Above", 200)).toBeNull();
  });
});

describe("estimatePayout", () => {
  it("counts the new stake in the pool it joins", () => {
    // Above 25, Below 75, stake 25 on Above => total 125, net 122.5,
    // winning side 50 => 25 * 122.5 / 50 = 61.25
    expect(estimatePayout(U(25), U(25), U(75), "Above", 200)).toBe(61_250_000n);
  });
  it("returns the stake back, less fee, when it is the only one", () => {
    expect(estimatePayout(U(10), 0n, 0n, "Above", 200)).toBe(9_800_000n);
  });
  it("has no value for a zero stake", () => {
    expect(estimatePayout(0n, U(25), U(75), "Above", 200)).toBeNull();
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run tests/unit/math.test.ts`
Expected: FAIL, cannot resolve `../../lib/recess/math`.

- [ ] **Step 4: Implement `lib/recess/math.ts`**

```ts
import type { Side } from "./types";

const BPS = 10_000n;

const pick = (above: bigint, below: bigint, side: Side) => (side === "Above" ? above : below);

/** Fraction of the pool held by one side. Half on an empty market, so the bar still renders. */
export function sideShare(poolAbove: bigint, poolBelow: bigint, side: Side): number {
  const total = poolAbove + poolBelow;
  if (total === 0n) return 0.5;
  return Number(pick(poolAbove, poolBelow, side)) / Number(total);
}

/** Update §3.3: (poolAbove + poolBelow) × (1 − feeBps / 10000) / poolSide. */
export function estimateMultiplier(
  poolAbove: bigint, poolBelow: bigint, side: Side, feeBps: number
): number | null {
  const sidePool = pick(poolAbove, poolBelow, side);
  if (sidePool === 0n) return null;
  const net = ((poolAbove + poolBelow) * (BPS - BigInt(feeBps))) / BPS;
  return Number(net) / Number(sidePool);
}

/**
 * Update §3.3: stake × (totalPool × (1 − feeBps / 10000)) / winningSidePool,
 * evaluated as though this stake has already joined its side.
 */
export function estimatePayout(
  stake: bigint, poolAbove: bigint, poolBelow: bigint, side: Side, feeBps: number
): bigint | null {
  if (stake <= 0n) return null;
  const above = side === "Above" ? poolAbove + stake : poolAbove;
  const below = side === "Below" ? poolBelow + stake : poolBelow;
  const winningSide = pick(above, below, side);
  if (winningSide === 0n) return null;
  const net = ((above + below) * (BPS - BigInt(feeBps))) / BPS;
  return (stake * net) / winningSide;
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run tests/unit/math.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 6: Write `lib/recess/format.ts` with its test**

`tests/unit/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatUsdg, formatPrice, formatPercent } from "../../lib/recess/format";

describe("formatters", () => {
  it("renders USDG with two decimals and thousands separators", () => {
    expect(formatUsdg(1_234_560_000n)).toBe("1,234.56");
    expect(formatUsdg(0n)).toBe("0.00");
  });
  it("renders a price with two decimals", () => {
    expect(formatPrice(184.2)).toBe("184.20");
  });
  it("signs a percentage move", () => {
    expect(formatPercent(0.0123)).toBe("+1.23%");
    expect(formatPercent(-0.0123)).toBe("-1.23%");
    expect(formatPercent(0)).toBe("0.00%");
  });
});
```

```ts
import { RECESS_CONFIG } from "./config";

const SCALE = 10 ** RECESS_CONFIG.usdgDecimals;

export function formatUsdg(v: bigint): string {
  return (Number(v) / SCALE).toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

export function formatPrice(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(v: number): string {
  const pct = (v * 100).toFixed(2);
  return v > 0 ? `+${pct}%` : `${pct}%`;
}
```

Run: `npx vitest run tests/unit/format.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: market types, pool arithmetic and value formatting

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: The client interface, the mock and the chain stub

**Files:**
- Create: `lib/recess/client.ts`, `lib/recess/mock.ts`, `lib/recess/chain.ts`, `lib/recess/abi.ts`, `tests/unit/mock-client.test.ts`

**Interfaces:**
- Consumes: types, `RECESS_CONFIG`, `isMock`, `epochAt`.
- Produces: `RecessClient`; `getClient(): RecessClient`; `MockClient`; `ChainClient`; `RECESS_MARKETS_ABI`.

- [ ] **Step 1: Write `lib/recess/client.ts`**

Update §6 fixes the method list. `listActivity` is included now so the indexer stage has a seat waiting for it.

```ts
import type { Market, Position, Activity, Side, TxResult } from "./types";
import type { Epoch } from "./schedule";
import { isMock } from "./config";

export interface RecessClient {
  getEpoch(): Promise<Epoch>;
  listMarkets(epochId: string): Promise<Market[]>;
  getMarket(epochId: string, ticker: string): Promise<Market | null>;
  getPositions(address: `0x${string}`): Promise<Position[]>;
  listActivity(marketId: string): Promise<Activity[]>;
  stake(marketId: string, side: Side, amount: bigint): Promise<TxResult>;
  claim(marketId: string): Promise<TxResult>;
  approveUsdg(amount: bigint): Promise<TxResult>;
  /** USDG allowance already granted to the markets contract. */
  getAllowance(address: `0x${string}`): Promise<bigint>;
  getUsdgBalance(address: `0x${string}`): Promise<bigint>;
}

let cached: RecessClient | null = null;

export function getClient(): RecessClient {
  if (cached) return cached;
  // Loaded lazily so the chain adapter never reaches a mock-only bundle.
  if (isMock()) {
    const { MockClient } = require("./mock") as typeof import("./mock");
    cached = new MockClient();
  } else {
    const { ChainClient } = require("./chain") as typeof import("./chain");
    cached = new ChainClient();
  }
  return cached;
}

/** Test seam. */
export function __resetClient() { cached = null; }
```

- [ ] **Step 2: Write the failing mock test**

Update §9 requires that a full round trip works in mock: stake both sides, fast-forward, then claim.

`tests/unit/mock-client.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { MockClient } from "../../lib/recess/mock";
import { RECESS_CONFIG } from "../../lib/recess/config";

const ME = "0x1111111111111111111111111111111111111111" as const;
const U = (n: number) => BigInt(n) * 1_000_000n;

let client: MockClient;
beforeEach(() => { client = new MockClient({ instant: true }); });

describe("MockClient", () => {
  it("lists one market per configured ticker", async () => {
    const epoch = await client.getEpoch();
    const markets = await client.listMarkets(epoch.id);
    expect(markets.map((m) => m.ticker)).toEqual([...RECESS_CONFIG.tickers]);
  });

  it("is deterministic across instances", async () => {
    const a = await new MockClient({ instant: true }).listMarkets((await client.getEpoch()).id);
    const b = await new MockClient({ instant: true }).listMarkets((await client.getEpoch()).id);
    expect(a.map((m) => m.poolAbove)).toEqual(b.map((m) => m.poolAbove));
    expect(a.map((m) => m.fridayClose)).toEqual(b.map((m) => m.fridayClose));
  });

  it("adds a stake to the chosen side and records the position", async () => {
    const epoch = await client.getEpoch();
    const [market] = await client.listMarkets(epoch.id);
    const before = market.poolAbove;

    await client.approveUsdg(U(10));
    await client.stake(market.id, "Above", U(10));

    const after = await client.getMarket(epoch.id, market.ticker);
    expect(after!.poolAbove).toBe(before + U(10));

    const positions = await client.getPositions(ME);
    expect(positions.find((p) => p.marketId === market.id)?.above).toBe(U(10));
  });

  it("refuses a stake once the market is locked", async () => {
    const epoch = await client.getEpoch();
    const [market] = await client.listMarkets(epoch.id);
    client.advanceTo("Locked");
    await expect(client.stake(market.id, "Above", U(10))).rejects.toThrow(/locked/i);
  });

  it("settles, names a winner and pays the winning side", async () => {
    const epoch = await client.getEpoch();
    const [market] = await client.listMarkets(epoch.id);
    await client.approveUsdg(U(100));
    await client.stake(market.id, "Above", U(10));
    await client.stake(market.id, "Below", U(10));

    client.advanceTo("Settled");
    const settled = await client.getMarket(epoch.id, market.ticker);
    expect(settled!.status).toBe("Settled");
    expect(settled!.winner).not.toBeNull();
    expect(settled!.settlePrice).not.toBeNull();

    const position = (await client.getPositions(ME)).find((p) => p.marketId === market.id)!;
    expect(position.payout).not.toBeNull();
    await client.claim(market.id);
    const claimed = (await client.getPositions(ME)).find((p) => p.marketId === market.id)!;
    expect(claimed.claimed).toBe(true);
  });

  it("voids and refunds when the settle price equals the Friday close", async () => {
    const epoch = await client.getEpoch();
    const [market] = await client.listMarkets(epoch.id);
    await client.approveUsdg(U(20));
    await client.stake(market.id, "Above", U(10));

    client.advanceTo("Void");
    const voided = await client.getMarket(epoch.id, market.ticker);
    expect(voided!.status).toBe("Void");

    const position = (await client.getPositions(ME)).find((p) => p.marketId === market.id)!;
    expect(position.payout).toBe(U(10)); // full refund, no fee
  });
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run tests/unit/mock-client.test.ts`
Expected: FAIL, cannot resolve `../../lib/recess/mock`.

- [ ] **Step 4: Implement `lib/recess/mock.ts`**

Deterministic figures come from a seeded generator keyed on the ticker, so every reload and every machine shows the same board. Transactions wait 1.5s as update §6 requires, except in tests. `advanceTo` is the developer fast-forward update §9 asks for.

```ts
import type { Market, Position, Activity, Side, TxResult, MarketStatus } from "./types";
import type { Epoch } from "./schedule";
import { epochAt } from "./schedule";
import { RECESS_CONFIG } from "./config";
import type { RecessClient } from "./client";

const DEMO_USER = "0x1111111111111111111111111111111111111111" as const;
const TX_DELAY_MS = 1500;

function seeded(key: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h = (h + 0x6D2B79F5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const usdg = (n: number) => BigInt(Math.round(n * 10 ** RECESS_CONFIG.usdgDecimals));

export class MockClient implements RecessClient {
  private markets = new Map<string, Market>();
  private positions = new Map<string, Position>();
  private activity = new Map<string, Activity[]>();
  private balance = usdg(5000);
  private allowance = 0n;
  private instant: boolean;
  private forced: MarketStatus | null = null;

  constructor(opts: { instant?: boolean } = {}) {
    this.instant = opts.instant ?? false;
    this.seed();
  }

  private wait() {
    return this.instant ? Promise.resolve() : new Promise((r) => setTimeout(r, TX_DELAY_MS));
  }

  private tx(): TxResult {
    return { hash: `0x${"de".repeat(32)}` as `0x${string}` };
  }

  private seed() {
    const epoch = epochAt(Date.now());
    for (const ticker of RECESS_CONFIG.tickers) {
      const rnd = seeded(`${epoch.id}:${ticker}`);
      const fridayClose = 40 + rnd() * 260;
      const drift = (rnd() - 0.5) * 0.06;
      const id = `${epoch.id}:${ticker}`;
      this.markets.set(id, {
        id, epochId: epoch.id, ticker,
        fridayClose: Number(fridayClose.toFixed(2)),
        poolPrice: Number((fridayClose * (1 + drift)).toFixed(2)),
        poolAbove: usdg(2000 + rnd() * 18000),
        poolBelow: usdg(2000 + rnd() * 18000),
        status: epoch.status,
        settlePrice: null, winner: null,
        openTime: epoch.openTime, lockTime: epoch.lockTime,
      });
      this.activity.set(id, Array.from({ length: 6 }, (_, i) => ({
        id: `${id}:${i}`,
        marketId: id,
        user: `0x${Math.floor(rnd() * 1e16).toString(16).padStart(40, "0").slice(0, 40)}` as `0x${string}`,
        side: (rnd() > 0.5 ? "Above" : "Below") as Side,
        amount: usdg(50 + rnd() * 900),
        at: Date.now() - Math.floor(rnd() * 6 * 3_600_000),
      })));
    }
  }

  /** Developer fast-forward (update §9). Not reachable in chain mode. */
  advanceTo(status: MarketStatus) {
    this.forced = status;
    for (const market of this.markets.values()) {
      market.status = status;
      if (status === "Settled") {
        const rnd = seeded(`settle:${market.id}`);
        const settle = market.fridayClose * (1 + (rnd() - 0.5) * 0.08);
        market.settlePrice = Number(settle.toFixed(2));
        market.winner = market.settlePrice > market.fridayClose ? "Above" : "Below";
      } else if (status === "Void") {
        market.settlePrice = market.fridayClose;
        market.winner = null;
      } else {
        market.settlePrice = null;
        market.winner = null;
      }
    }
    this.repricePositions();
  }

  private repricePositions() {
    for (const position of this.positions.values()) {
      const market = this.markets.get(position.marketId)!;
      position.status = market.status;
      position.winner = market.winner;
      if (market.status === "Void") {
        position.payout = position.above + position.below;
      } else if (market.status === "Settled" && market.winner) {
        const staked = market.winner === "Above" ? position.above : position.below;
        const winningPool = market.winner === "Above" ? market.poolAbove : market.poolBelow;
        const net = ((market.poolAbove + market.poolBelow) * BigInt(10_000 - RECESS_CONFIG.feeBps)) / 10_000n;
        position.payout = winningPool === 0n ? 0n : (staked * net) / winningPool;
      } else {
        position.payout = null;
      }
    }
  }

  async getEpoch(): Promise<Epoch> {
    const epoch = epochAt(Date.now());
    return this.forced && this.forced !== "Open" ? { ...epoch, status: "Locked" } : epoch;
  }

  async listMarkets(epochId: string): Promise<Market[]> {
    return [...this.markets.values()].filter((m) => m.epochId === epochId).map((m) => ({ ...m }));
  }

  async getMarket(epochId: string, ticker: string): Promise<Market | null> {
    const market = this.markets.get(`${epochId}:${ticker}`);
    return market ? { ...market } : null;
  }

  async getPositions(): Promise<Position[]> {
    return [...this.positions.values()].map((p) => ({ ...p }));
  }

  async listActivity(marketId: string): Promise<Activity[]> {
    return [...(this.activity.get(marketId) ?? [])].sort((a, b) => b.at - a.at);
  }

  async getUsdgBalance(): Promise<bigint> { return this.balance; }
  async getAllowance(): Promise<bigint> { return this.allowance; }

  async approveUsdg(amount: bigint): Promise<TxResult> {
    await this.wait();
    this.allowance = amount;
    return this.tx();
  }

  async stake(marketId: string, side: Side, amount: bigint): Promise<TxResult> {
    const market = this.markets.get(marketId);
    if (!market) throw new Error("Unknown market");
    if (market.status !== "Open") throw new Error("Betting is closed on this market: it is locked.");
    if (amount <= 0n) throw new Error("Enter an amount");
    if (amount > this.balance) throw new Error("Not enough USDG in your wallet");
    await this.wait();

    this.balance -= amount;
    this.allowance = this.allowance > amount ? this.allowance - amount : 0n;
    if (side === "Above") market.poolAbove += amount; else market.poolBelow += amount;

    const existing = this.positions.get(marketId) ?? {
      marketId, ticker: market.ticker, above: 0n, below: 0n,
      claimed: false, status: market.status, winner: null, payout: null,
    };
    if (side === "Above") existing.above += amount; else existing.below += amount;
    this.positions.set(marketId, existing);

    this.activity.get(marketId)?.unshift({
      id: `${marketId}:${Date.now()}`, marketId, user: DEMO_USER, side, amount, at: Date.now(),
    });
    this.repricePositions();
    return this.tx();
  }

  async claim(marketId: string): Promise<TxResult> {
    const position = this.positions.get(marketId);
    if (!position) throw new Error("Nothing to claim");
    if (position.claimed) throw new Error("Already claimed");
    if (position.payout === null) throw new Error("This market has not settled yet.");
    await this.wait();
    this.balance += position.payout;
    position.claimed = true;
    return this.tx();
  }
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run tests/unit/mock-client.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 6: Write `lib/recess/abi.ts`**

Update §6's Solidity block, transcribed as a TypeScript ABI constant. No `.sol` file is created. Changes to the contract shape stay inside this file and `chain.ts`.

```ts
/**
 * Draft ABI for IRecessMarkets, transcribed from corrective brief §6.
 * The contract does not exist yet. This is the shape the UI is written against,
 * so the contract stage can be checked against it. Update §6 requires that
 * revisions stay inside this file and chain.ts.
 */
export const RECESS_MARKETS_ABI = [
  {
    type: "function", name: "stake", stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "bytes32" },
      { name: "side", type: "uint8" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "claim", stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [{ name: "paid", type: "uint256" }],
  },
  {
    type: "function", name: "market", stateMutability: "view",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [
      { name: "ticker", type: "bytes32" },
      { name: "openTime", type: "uint64" },
      { name: "lockTime", type: "uint64" },
      { name: "fridayClose", type: "int256" },
      { name: "settlePrice", type: "int256" },
      { name: "poolAbove", type: "uint256" },
      { name: "poolBelow", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "winner", type: "uint8" },
    ],
  },
  {
    type: "function", name: "positionOf", stateMutability: "view",
    inputs: [{ name: "marketId", type: "bytes32" }, { name: "user", type: "address" }],
    outputs: [
      { name: "above", type: "uint256" },
      { name: "below", type: "uint256" },
      { name: "claimed", type: "bool" },
    ],
  },
  {
    type: "event", name: "Staked",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "side", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "Settled",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "settlePrice", type: "int256", indexed: false },
      { name: "winner", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event", name: "Voided",
    inputs: [{ name: "marketId", type: "bytes32", indexed: true }],
  },
  {
    type: "event", name: "Claimed",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

/** Contract enum order, matching update §6. */
export const SIDE_INDEX = { Above: 0, Below: 1 } as const;
export const STATUS_BY_INDEX = ["Open", "Locked", "Settled", "Void"] as const;
```

- [ ] **Step 7: Write `lib/recess/chain.ts`**

An empty shell. It must compile and it must fail loudly rather than silently returning nothing.

```ts
import type { Market, Position, Activity, Side, TxResult } from "./types";
import type { Epoch } from "./schedule";
import type { RecessClient } from "./client";

const TODO = (what: string): never => {
  throw new Error(`ChainClient.${what} is not implemented: contracts are the next stage.`);
};

/**
 * Contract-backed adapter. Deliberately empty.
 * TODO(contracts): read through wagmi/viem using RECESS_MARKETS_ABI and ENV.marketsAddress.
 * TODO(indexer): listActivity needs an event indexer; until then the UI runs in mock.
 */
export class ChainClient implements RecessClient {
  async getEpoch(): Promise<Epoch> { return TODO("getEpoch"); }
  async listMarkets(_epochId: string): Promise<Market[]> { return TODO("listMarkets"); }
  async getMarket(_epochId: string, _ticker: string): Promise<Market | null> { return TODO("getMarket"); }
  async getPositions(_address: `0x${string}`): Promise<Position[]> { return TODO("getPositions"); }
  async listActivity(_marketId: string): Promise<Activity[]> { return TODO("listActivity"); }
  async stake(_marketId: string, _side: Side, _amount: bigint): Promise<TxResult> { return TODO("stake"); }
  async claim(_marketId: string): Promise<TxResult> { return TODO("claim"); }
  async approveUsdg(_amount: bigint): Promise<TxResult> { return TODO("approveUsdg"); }
  async getAllowance(_address: `0x${string}`): Promise<bigint> { return TODO("getAllowance"); }
  async getUsdgBalance(_address: `0x${string}`): Promise<bigint> { return TODO("getUsdgBalance"); }
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: RecessClient interface, deterministic mock adapter and chain stub

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: The stake button state machine

Update §5 gives an ordered table of states. Encoding it as a pure function keeps the ordering correct and testable, and stops the rules from scattering across JSX.

**Files:**
- Create: `lib/recess/action-state.ts`, `tests/unit/action-state.test.ts`

**Interfaces:**
- Consumes: `Side`, `MarketStatus`.
- Produces: `resolveAction(input): Action` where `Action = { kind: ActionKind; label: string; disabled: boolean }` and `ActionKind = "connect" | "switch" | "amount" | "balance" | "approve" | "stake" | "pending" | "closed"`.

- [ ] **Step 1: Write the failing test**

The order matters: a disconnected wallet on a locked market must still say `Betting is closed`, because the market state is the outer fact.

`tests/unit/action-state.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveAction } from "../../lib/recess/action-state";

const base = {
  status: "Open" as const,
  connected: true,
  rightNetwork: true,
  amount: 10_000_000n,
  balance: 100_000_000n,
  allowance: 100_000_000n,
  side: "Above" as const,
  pending: false,
};

describe("resolveAction", () => {
  it("closes betting once the market is locked, whatever the wallet does", () => {
    expect(resolveAction({ ...base, status: "Locked", connected: false }))
      .toEqual({ kind: "closed", label: "Betting is closed. Settles at the open.", disabled: true });
  });

  it("asks for a wallet first", () => {
    expect(resolveAction({ ...base, connected: false }).kind).toBe("connect");
  });

  it("asks for the right network before anything else", () => {
    expect(resolveAction({ ...base, rightNetwork: false }).label).toBe("Switch network");
  });

  it("waits for an amount", () => {
    const a = resolveAction({ ...base, amount: 0n });
    expect(a).toEqual({ kind: "amount", label: "Enter an amount", disabled: true });
  });

  it("refuses an amount above the balance", () => {
    const a = resolveAction({ ...base, amount: 200_000_000n });
    expect(a).toEqual({ kind: "balance", label: "Not enough USDG in your wallet", disabled: true });
  });

  it("asks for approval when the allowance is short", () => {
    expect(resolveAction({ ...base, allowance: 0n }).label).toBe("Approve USDG");
  });

  it("names the side it will stake on", () => {
    expect(resolveAction(base).label).toBe("Stake on Above");
    expect(resolveAction({ ...base, side: "Below" }).label).toBe("Stake on Below");
  });

  it("shows progress while a transaction is in flight", () => {
    expect(resolveAction({ ...base, pending: true }))
      .toEqual({ kind: "pending", label: "Confirming…", disabled: true });
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run tests/unit/action-state.test.ts`
Expected: FAIL, cannot resolve `../../lib/recess/action-state`.

- [ ] **Step 3: Implement `lib/recess/action-state.ts`**

```ts
import type { Side, MarketStatus } from "./types";

export type ActionKind =
  | "connect" | "switch" | "amount" | "balance"
  | "approve" | "stake" | "pending" | "closed";

export type Action = { kind: ActionKind; label: string; disabled: boolean };

export type ActionInput = {
  status: MarketStatus;
  connected: boolean;
  rightNetwork: boolean;
  amount: bigint;
  balance: bigint;
  allowance: bigint;
  side: Side;
  pending: boolean;
};

/** Update §5, evaluated in the order the brief lists. */
export function resolveAction(i: ActionInput): Action {
  if (i.status !== "Open") {
    return { kind: "closed", label: "Betting is closed. Settles at the open.", disabled: true };
  }
  if (i.pending) return { kind: "pending", label: "Confirming…", disabled: true };
  if (!i.connected) return { kind: "connect", label: "Connect wallet", disabled: false };
  if (!i.rightNetwork) return { kind: "switch", label: "Switch network", disabled: false };
  if (i.amount <= 0n) return { kind: "amount", label: "Enter an amount", disabled: true };
  if (i.amount > i.balance) {
    return { kind: "balance", label: "Not enough USDG in your wallet", disabled: true };
  }
  if (i.allowance < i.amount) return { kind: "approve", label: "Approve USDG", disabled: false };
  return { kind: "stake", label: `Stake on ${i.side}`, disabled: false };
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx vitest run tests/unit/action-state.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: pure state machine for the stake action button

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: App shell, header, epoch bar and legal gate

**Files:**
- Create: `app/app/layout.tsx`, `components/app/AppHeader.tsx`, `components/app/EpochBar.tsx`, `components/app/LegalGate.tsx`, `components/app/Toast.tsx`, `components/app/DevEpochControls.tsx`

**Interfaces:**
- Consumes: `Lockup`, `getClient`, `epochAt`, `formatCountdown`, `formatUsdg`, `isMock`.
- Produces: `<AppHeader/>`, `<EpochBar/>`, `<LegalGate/>`, `useToast()` returning `{ push(message, opts?) }`, `<ToastHost/>`.

- [ ] **Step 1: Implement the header**

Update §4: lockup on the left linking to `/`, `Board` and `Portfolio` in the centre, `Connect wallet` on the right, replaced after connection by the address and USDG balance. In mock mode a `Demo data` badge is always visible.

Design note: the app is on a white background, so the lockup renders in `ink`, not white. Pass a colour class rather than changing `Lockup`, which the hero needs white.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Mark } from "@/components/ui/Mark";
import { Wordmark } from "@/components/ui/Wordmark";
import { getClient } from "@/lib/recess/client";
import { formatUsdg } from "@/lib/recess/format";
import { isMock } from "@/lib/recess/config";

const NAV = [
  { href: "/app", label: "Board" },
  { href: "/app/portfolio", label: "Portfolio" },
];

export function AppHeader() {
  const path = usePathname();
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    if (!isConnected || !address) { setBalance(null); return; }
    let alive = true;
    getClient().getUsdgBalance(address).then((b) => { if (alive) setBalance(b); });
    return () => { alive = false; };
  }, [isConnected, address]);

  return (
    <header className="border-b border-line bg-white">
      <div className="container-recess flex h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="Recess" className="flex items-center gap-2 text-ink">
          <Mark height={22} />
          <Wordmark size={26} />
        </Link>

        <nav className="flex items-center gap-7" aria-label="App">
          {NAV.map((item) => {
            const active = item.href === "/app" ? path === "/app" : path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active ? "text-ink" : "text-body hover:text-ink"}
                style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 16 }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isMock() && (
            <span
              className="rounded-full border border-line px-3 py-1 text-[13px] text-body"
              title="Figures on this screen are demonstration data, not live markets."
            >
              Demo data
            </span>
          )}
          {isConnected && balance !== null && (
            <span className="tabular text-[15px] text-ink">{formatUsdg(balance)} USDG</span>
          )}
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Implement the epoch bar**

Update §4: the weekend label, the status and a countdown to the next stage. Times are shown in Eastern with the local time in a tooltip (update §3.2).

```tsx
"use client";

import { useEffect, useState } from "react";
import { epochAt, formatCountdown } from "@/lib/recess/schedule";

export function EpochBar() {
  const [state, setState] = useState<{ label: string; status: string; left: string } | null>(null);
  const [localHint, setLocalHint] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const epoch = epochAt(now);
      setState({
        label: epoch.label,
        status: epoch.status,
        left: epoch.status === "Open" ? formatCountdown(epoch.lockTime - now) : "—",
      });
      setLocalHint(
        `Locks ${new Date(epoch.lockTime).toLocaleString(undefined, {
          weekday: "short", hour: "numeric", minute: "2-digit",
        })} your time`
      );
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-b border-line bg-white" data-testid="epoch-bar">
      <div className="container-recess flex h-[52px] flex-wrap items-center gap-x-6 gap-y-1">
        <span className="text-ink" style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 15 }}>
          {state?.label ?? " "}
        </span>
        <span className="rounded-full border border-line px-3 py-[2px] text-[13px] text-body">
          {state?.status ?? " "}
        </span>
        <span className="tabular text-[15px] text-body" title={localHint}>
          {state && state.status === "Open" ? `Locks in ${state.left} ET` : "Settling at the open"}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement the legal gate**

Update §8: on first entry to `/app`, a modal asks the visitor to confirm they are outside the United States and other restricted jurisdictions and that they understand the risks. The acknowledgement is kept locally. The text is a placeholder awaiting counsel.

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "recess-jurisdiction-ack";

export function LegalGate() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try { setOpen(localStorage.getItem(KEY) !== "1"); } catch { setOpen(true); }
  }, []);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="gate-title"
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(1,3,32,.45)] px-6">
      <div className="w-full max-w-[520px] rounded-[32px] border border-line bg-white p-9">
        <h2 id="gate-title" className="text-ink"
          style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 28, lineHeight: 1.2 }}>
          Before you continue
        </h2>
        <p className="mt-4 text-body" style={{ fontFamily: "var(--font-inter)", fontSize: 16, lineHeight: 1.5 }}>
          Placeholder text pending legal review. Recess is not affiliated with Robinhood Markets and is not
          available in the United States or other restricted jurisdictions. Staking on a market puts funds at
          risk and outcomes are settled from a reference price feed. See the{" "}
          <Link href="/terms" className="underline underline-offset-4">Terms</Link> and the{" "}
          <Link href="/risk" className="underline underline-offset-4">Risk disclosure</Link>.
        </p>

        <label className="mt-6 flex items-start gap-3 text-ink"
          style={{ fontFamily: "var(--font-inter)", fontSize: 15, lineHeight: 1.5 }}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#0A68F5]" />
          I am not located in the United States or another restricted jurisdiction, and I understand the risks.
        </label>

        <button
          type="button"
          disabled={!checked}
          onClick={() => { try { localStorage.setItem(KEY, "1"); } catch {} setOpen(false); }}
          className="mt-7 h-[52px] w-full rounded-full bg-ink text-white transition-colors duration-200 enabled:hover:bg-[#0D1238] disabled:opacity-40"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18 }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement the toast host**

Update §5 needs toasts carrying an explorer link on success and a reason on failure.

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

type Toast = { id: number; message: string; href?: string; tone: "ok" | "error" };
type Ctx = { push: (message: string, opts?: { href?: string; tone?: "ok" | "error" }) => void };

const ToastCtx = createContext<Ctx>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((message: string, opts?: { href?: string; tone?: "ok" | "error" }) => {
    const id = Date.now() + Math.random();
    setItems((t) => [...t, { id, message, href: opts?.href, tone: opts?.tone ?? "ok" }]);
    setTimeout(() => setItems((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id}
            className="flex max-w-[360px] items-start gap-3 rounded-[32px] border border-line bg-white px-6 py-4 shadow-[0_20px_40px_rgba(1,3,32,.10)]"
            style={{ fontFamily: "var(--font-inter)", fontSize: 15 }}>
            <span className={t.tone === "error" ? "text-[#C81E1E]" : "text-ink"}>{t.message}</span>
            {t.href && (
              <a href={t.href} target="_blank" rel="noreferrer" className="shrink-0 text-blue underline underline-offset-4">
                View
              </a>
            )}
            <button type="button" aria-label="Dismiss" className="ml-auto text-body"
              onClick={() => setItems((x) => x.filter((i) => i.id !== t.id))}>
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
```

- [ ] **Step 5: Implement `DevEpochControls` and the app layout**

Update §9 requires a developer control that fast-forwards the epoch in mock mode, so a settle and a claim can be exercised without waiting for a weekend. It renders only when the mode is mock.

```tsx
"use client";

import { isMock } from "@/lib/recess/config";
import { getClient } from "@/lib/recess/client";
import type { MockClient } from "@/lib/recess/mock";

export function DevEpochControls() {
  if (!isMock()) return null;
  const client = getClient() as unknown as MockClient;
  const go = (status: "Open" | "Locked" | "Settled" | "Void") => {
    client.advanceTo(status);
    window.location.reload();
  };
  return (
    <div className="container-recess flex items-center gap-2 py-3 text-[13px] text-body">
      <span>Demo controls:</span>
      {(["Open", "Locked", "Settled", "Void"] as const).map((s) => (
        <button key={s} type="button" onClick={() => go(s)}
          className="rounded-full border border-line px-3 py-1 hover:text-ink">
          {s}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// app/app/layout.tsx
import { AppHeader } from "@/components/app/AppHeader";
import { EpochBar } from "@/components/app/EpochBar";
import { LegalGate } from "@/components/app/LegalGate";
import { ToastHost } from "@/components/app/Toast";
import { DevEpochControls } from "@/components/app/DevEpochControls";

export const metadata = { title: "Board — Recess" };

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastHost>
      <AppHeader />
      <EpochBar />
      <DevEpochControls />
      <main className="container-recess py-10">{children}</main>
      <LegalGate />
    </ToastHost>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: app shell with header, epoch bar, legal gate, toasts and demo controls

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Board

**Files:**
- Create: `app/app/page.tsx`, `components/app/MarketTable.tsx`, `components/app/SideBar.tsx`

**Interfaces:**
- Consumes: `getClient`, `sideShare`, `estimateMultiplier`, formatters, `RECESS_CONFIG`.
- Produces: `<MarketTable markets positions/>`, `<SideBar above below/>`; DOM contract `[data-testid="market-row"]`.

- [ ] **Step 1: Implement `SideBar`**

The ratio bar uses the two side colours from update §7.

```tsx
import { sideShare } from "@/lib/recess/math";

export function SideBar({ above, below }: { above: bigint; below: bigint }) {
  const share = sideShare(above, below, "Above");
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]"
      role="img"
      aria-label={`Above holds ${Math.round(share * 100)} percent of the pool`}>
      <div className="h-full" style={{ width: `${share * 100}%`, background: "#0EE8CC" }} />
    </div>
  );
}
```

- [ ] **Step 2: Implement `MarketTable`**

Update §4 column list: ticker, Friday close, current pool price with its percentage move, the two pools, the ratio bar, estimated multipliers, the visitor's position, and a `Take a side` link. Sortable by ticker and by pool size, searchable by ticker. Below 768 each row becomes a card.

Every multiplier is labelled `est.` per update §3.3.

```tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Market, Position } from "@/lib/recess/types";
import { estimateMultiplier } from "@/lib/recess/math";
import { formatUsdg, formatPrice, formatPercent } from "@/lib/recess/format";
import { RECESS_CONFIG } from "@/lib/recess/config";
import { SideBar } from "./SideBar";

type Sort = "ticker" | "pool";

export function MarketTable({ markets, positions }: { markets: Market[]; positions: Position[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("pool");

  const rows = useMemo(() => {
    const filtered = markets.filter((m) => m.ticker.toLowerCase().includes(query.trim().toLowerCase()));
    return [...filtered].sort((a, b) =>
      sort === "ticker"
        ? a.ticker.localeCompare(b.ticker)
        : Number(b.poolAbove + b.poolBelow - (a.poolAbove + a.poolBelow))
    );
  }, [markets, query, sort]);

  const mine = (id: string) => positions.find((p) => p.marketId === id);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="relative flex-1 sm:max-w-[280px]">
          <span className="sr-only">Search by ticker</span>
          <Search size={16} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker"
            className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-4 text-ink outline-none placeholder:text-body focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue"
            style={{ fontFamily: "var(--font-inter)", fontSize: 15 }}
          />
        </label>
        <div className="flex gap-2">
          {(["pool", "ticker"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSort(s)}
              className={`h-11 rounded-full border px-4 text-[15px] ${sort === s ? "border-ink text-ink" : "border-line text-body"}`}>
              {s === "pool" ? "Largest pool" : "A to Z"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-line bg-white">
        <table className="hidden w-full md:table">
          <caption className="sr-only">Markets for the current weekend</caption>
          <thead>
            <tr className="border-b border-line text-left text-[13px] text-body">
              <th scope="col" className="px-6 py-4">Ticker</th>
              <th scope="col" className="px-6 py-4">Friday close</th>
              <th scope="col" className="px-6 py-4">Pool price</th>
              <th scope="col" className="px-6 py-4">Above</th>
              <th scope="col" className="px-6 py-4">Below</th>
              <th scope="col" className="px-6 py-4">Split</th>
              <th scope="col" className="px-6 py-4">Your position</th>
              <th scope="col" className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const position = mine(m.id);
              const up = estimateMultiplier(m.poolAbove, m.poolBelow, "Above", RECESS_CONFIG.feeBps);
              const down = estimateMultiplier(m.poolAbove, m.poolBelow, "Below", RECESS_CONFIG.feeBps);
              const move = (m.poolPrice - m.fridayClose) / m.fridayClose;
              return (
                <tr key={m.id} data-testid="market-row" className="border-b border-line last:border-0">
                  <th scope="row" className="px-6 py-5 text-left text-ink"
                    style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 16 }}>
                    {m.ticker}
                  </th>
                  <td className="tabular px-6 py-5 text-ink">{formatPrice(m.fridayClose)}</td>
                  <td className="tabular px-6 py-5">
                    <span className="text-ink">{formatPrice(m.poolPrice)}</span>{" "}
                    <span className={move >= 0 ? "text-[#0BBF98]" : "text-[#A48CFE]"}>{formatPercent(move)}</span>
                  </td>
                  <td className="tabular px-6 py-5 text-ink">
                    {formatUsdg(m.poolAbove)}
                    <span className="block text-[13px] text-body">{up ? `est. ${up.toFixed(2)}x` : "—"}</span>
                  </td>
                  <td className="tabular px-6 py-5 text-ink">
                    {formatUsdg(m.poolBelow)}
                    <span className="block text-[13px] text-body">{down ? `est. ${down.toFixed(2)}x` : "—"}</span>
                  </td>
                  <td className="w-[140px] px-6 py-5"><SideBar above={m.poolAbove} below={m.poolBelow} /></td>
                  <td className="tabular px-6 py-5 text-ink">
                    {position ? `${formatUsdg(position.above + position.below)}` : "—"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link href={`/app/${m.ticker}`}
                      className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-[15px] text-white hover:bg-[#0D1238]">
                      Take a side
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Update §4: cards on phones. */}
        <ul className="md:hidden">
          {rows.map((m) => (
            <li key={m.id} data-testid="market-row" className="border-b border-line p-6 last:border-0">
              <div className="flex items-baseline justify-between">
                <span className="text-ink" style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18 }}>
                  {m.ticker}
                </span>
                <span className="tabular text-[15px] text-body">
                  {formatPrice(m.fridayClose)} → {formatPrice(m.poolPrice)}
                </span>
              </div>
              <div className="mt-4"><SideBar above={m.poolAbove} below={m.poolBelow} /></div>
              <div className="tabular mt-3 flex justify-between text-[14px] text-body">
                <span>Above {formatUsdg(m.poolAbove)}</span>
                <span>Below {formatUsdg(m.poolBelow)}</span>
              </div>
              <Link href={`/app/${m.ticker}`}
                className="mt-5 flex h-11 items-center justify-center rounded-full bg-ink text-[15px] text-white">
                Take a side
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Implement the Board page**

Data loads on the client because the client adapter is client-side by design and there is no server layer.

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getClient } from "@/lib/recess/client";
import type { Market, Position } from "@/lib/recess/types";
import { MarketTable } from "@/components/app/MarketTable";

export default function BoardPage() {
  const { address } = useAccount();
  const [markets, setMarkets] = useState<Market[] | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const client = getClient();
      const epoch = await client.getEpoch();
      const list = await client.listMarkets(epoch.id);
      if (!alive) return;
      setMarkets(list);
      if (address) setPositions(await client.getPositions(address));
    })();
    return () => { alive = false; };
  }, [address]);

  if (!markets) return <p className="text-body">Loading the board…</p>;

  return (
    <>
      <h1 className="mb-8 text-ink"
        style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 40, lineHeight: 1.1 }}>
        This Weekend's Board
      </h1>
      <MarketTable markets={markets} positions={positions} />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: board with sortable, searchable market table

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Market page and the stake panel

**Files:**
- Create: `app/app/[ticker]/page.tsx`, `components/app/StakePanel.tsx`, `components/app/EpochTimeline.tsx`, `components/app/ActivityFeed.tsx`, `components/app/RulesBlock.tsx`

**Interfaces:**
- Consumes: `getClient`, `resolveAction`, `estimatePayout`, `estimateMultiplier`, `useToast`, `useAccount`, `useSwitchChain`.
- Produces: the five components above; DOM contracts `[data-testid="stake-panel"]`, `[data-testid="stake-action"]`.

- [ ] **Step 1: Implement the supporting blocks**

`EpochTimeline` shows Friday close → Locked → Settled with the current stage marked. `RulesBlock` states, in the site's own words, that settlement comes from the Chainlink reference feed rather than the pool, and lists the three void cases from update §3.4: the first print equalling the Friday close, an empty side at lock, and no fresh print within the configured window. `ActivityFeed` lists recent stakes from `listActivity`, each row a side, an amount and a relative time.

- [ ] **Step 2: Implement `StakePanel`**

The side toggle uses the two side colours. The amount field carries a `Max` button. The estimate line shows the payout and multiplier, both marked `est.` while the market is open. The action button reads its label and disabled state from `resolveAction` alone, so update §5's ordering cannot drift.

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { Market } from "@/lib/recess/types";
import type { Side } from "@/lib/recess/types";
import { resolveAction } from "@/lib/recess/action-state";
import { estimatePayout, estimateMultiplier } from "@/lib/recess/math";
import { formatUsdg } from "@/lib/recess/format";
import { RECESS_CONFIG, ENV } from "@/lib/recess/config";
import { getClient } from "@/lib/recess/client";
import { useToast } from "./Toast";

const SCALE = 10 ** RECESS_CONFIG.usdgDecimals;
const toBase = (v: string): bigint => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? BigInt(Math.round(n * SCALE)) : 0n;
};

export function StakePanel({ market, onChanged }: { market: Market; onChanged: () => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const toast = useToast();

  const [side, setSide] = useState<Side>("Above");
  const [raw, setRaw] = useState("");
  const [balance, setBalance] = useState(0n);
  const [allowance, setAllowance] = useState(0n);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!address) return;
    const client = getClient();
    client.getUsdgBalance(address).then(setBalance);
    client.getAllowance(address).then(setAllowance);
  }, [address, pending]);

  const amount = toBase(raw);
  const action = resolveAction({
    status: market.status,
    connected: isConnected,
    rightNetwork: chainId === ENV.chainId || ENV.chainId === 0,
    amount, balance, allowance, side, pending,
  });

  const payout = useMemo(
    () => estimatePayout(amount, market.poolAbove, market.poolBelow, side, RECESS_CONFIG.feeBps),
    [amount, market.poolAbove, market.poolBelow, side]
  );
  const multiplier = estimateMultiplier(market.poolAbove, market.poolBelow, side, RECESS_CONFIG.feeBps);

  async function run() {
    const client = getClient();
    setPending(true);
    try {
      if (action.kind === "approve") {
        const { hash } = await client.approveUsdg(amount);
        toast.push("USDG approved", { href: ENV.explorerUrl ? `${ENV.explorerUrl}/tx/${hash}` : undefined });
        setAllowance(amount);
      } else if (action.kind === "stake") {
        const { hash } = await client.stake(market.id, side, amount);
        toast.push("Stake placed", { href: ENV.explorerUrl ? `${ENV.explorerUrl}/tx/${hash}` : undefined });
        setRaw("");
        onChanged();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      toast.push(
        /reject|denied|user/i.test(message)
          ? "Transaction rejected in wallet"
          : "Transaction failed. Try again.",
        { tone: "error" }
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <aside data-testid="stake-panel" className="rounded-[32px] border border-line bg-white p-8">
      <div className="grid grid-cols-2 gap-3">
        {(["Above", "Below"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSide(s)}
            aria-pressed={side === s}
            className={`h-12 rounded-full border text-[16px] transition-colors duration-200 ${
              side === s ? "border-blue bg-blue text-white" : "border-line text-ink hover:border-ink"
            }`}>
            {s}
          </button>
        ))}
      </div>

      <label className="mt-6 block">
        <span className="text-[14px] text-body">Amount in USDG</span>
        <span className="mt-2 flex h-14 items-center rounded-full border border-line px-5">
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
            placeholder="0.00"
            disabled={market.status !== "Open"}
            className="tabular w-full bg-transparent text-ink outline-none placeholder:text-body"
            style={{ fontFamily: "var(--font-inter)", fontSize: 18 }}
          />
          <button type="button" onClick={() => setRaw(String(Number(balance) / SCALE))}
            className="ml-3 shrink-0 text-[14px] text-blue">
            Max
          </button>
        </span>
        <span className="tabular mt-2 block text-[13px] text-body">
          Balance {formatUsdg(balance)} USDG · minimum {RECESS_CONFIG.minStake} USDG
        </span>
      </label>

      <dl className="tabular mt-6 space-y-2 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-body">{market.status === "Open" ? "Payout, est." : "Payout"}</dt>
          <dd className="text-ink">{payout ? `${formatUsdg(payout)} USDG` : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-body">{market.status === "Open" ? "Multiplier, est." : "Multiplier"}</dt>
          <dd className="text-ink">{multiplier ? `${multiplier.toFixed(2)}x` : "—"}</dd>
        </div>
      </dl>

      <div className="mt-7">
        {action.kind === "connect" ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button type="button" onClick={openConnectModal} data-testid="stake-action"
                className="h-[52px] w-full rounded-full bg-ink text-white hover:bg-[#0D1238]"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18 }}>
                {action.label}
              </button>
            )}
          </ConnectButton.Custom>
        ) : (
          <button
            type="button"
            data-testid="stake-action"
            disabled={action.disabled}
            onClick={() => (action.kind === "switch" ? switchChain({ chainId: ENV.chainId }) : run())}
            className="h-[52px] w-full rounded-full bg-ink text-white transition-colors duration-200 enabled:hover:bg-[#0D1238] disabled:opacity-40"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18 }}
          >
            {action.label}
          </button>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Implement the market page**

Left column: the key figures, the ratio bar, the timeline, the rules block and the activity feed. Right column: the stake panel. After settlement the panel is replaced by the result and a `Claim` button, or `Refund` when the market voided.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: market page with the stake panel, timeline, rules and activity feed

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Portfolio

**Files:**
- Create: `app/app/portfolio/page.tsx`

- [ ] **Step 1: Implement the three tabs**

Update §4: `Open` holds stakes awaiting settlement, `Claimable` holds winnings and refunds each with a `Claim` button, `History` holds everything settled and claimed. Tabs are buttons with `aria-selected` inside a `role="tablist"`.

The empty state points back to the board with the brief's exact words: `No open positions. Pick a side on the board.` and the phrase links to `/app`.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: portfolio with open, claimable and history tabs

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: End-to-end acceptance

**Files:**
- Create: `tests/e2e/app.spec.ts`

- [ ] **Step 1: Write the flow test**

Update §9's acceptance list, automated as far as a wallet allows. Wallet connection itself is exercised by hand, since RainbowKit drives a real extension; the test drives everything downstream by seeding the acknowledgement and using the demo controls.

```ts
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("recess-jurisdiction-ack", "1"));
});

test("the board lists a market for every configured ticker", async ({ page }) => {
  await page.goto("/app");
  await expect(page.locator('[data-testid="market-row"]').first()).toBeVisible();
});

test("the demo badge is visible while the app runs on mock data", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByText("Demo data")).toBeVisible();
});

test("the epoch bar names the weekend and its status", async ({ page }) => {
  await page.goto("/app");
  await expect(page.locator('[data-testid="epoch-bar"]')).toContainText(/Weekend of/);
});

test("a disconnected visitor is asked to connect before staking", async ({ page }) => {
  await page.goto("/app");
  await page.locator('[data-testid="market-row"]').first().getByRole("link", { name: "Take a side" }).click();
  await expect(page.locator('[data-testid="stake-action"]')).toContainText("Connect wallet");
});

test("a locked market closes the panel", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("button", { name: "Locked" }).click();
  await page.locator('[data-testid="market-row"]').first().getByRole("link", { name: "Take a side" }).click();
  await expect(page.locator('[data-testid="stake-action"]')).toContainText("Betting is closed");
});

test("the legal gate appears on a first visit", async ({ page, context }) => {
  await context.clearCookies();
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/app");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
});
```

- [ ] **Step 2: Run the suite**

Run: `npm run test:e2e`
Expected: PASS.

- [ ] **Step 3: Walk update §9 by hand**

With a wallet connected in mock mode: stake on both sides of one market, use the demo control to reach `Settled`, then claim; repeat reaching `Void` and take the refund. Confirm every state in update §5's table appears. Confirm no page mentions a waitlist.

- [ ] **Step 4: Verify the no-backend rule mechanically**

```bash
test ! -d app/api && echo "no api routes"
find . -name "*.sol" -not -path "./node_modules/*" | wc -l   # expect 0
grep -rn "use server" app components lib | wc -l              # expect 0
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: end-to-end acceptance for the board, market and legal gate

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage.** Update §preamble's no-backend rule is a global constraint and is checked in Task 8 Step 4. §3.1 market mechanics are the types in Task 1 and the mock in Task 2. §3.2 schedule comes from the landing plan and is consumed by the epoch bar in Task 4. §3.3 formulas are Task 1, tested independently of React. §3.4 void cases are modelled in the mock and stated in the rules block in Task 6. §4 routes and screens are Tasks 4 to 7. §5 wallet states are the pure resolver in Task 3, consumed only by the stake panel in Task 6. §6 data layer is Task 2, including `listActivity` for the future indexer and an ABI constant rather than a Solidity file. §7 design language runs through every component. §8 legal gate and stub pages are Task 4 here and Task 16 of the landing plan. §9 order of work matches Tasks 1 to 8; its acceptance list is Task 8. §10 open questions live only in `lib/recess/config.ts` and `lib/recess/schedule.ts`.

**Known gaps, deliberate.** `ChainClient` throws by design; the app runs on mock until contracts exist. Wallet connection itself is not automated in Playwright because it needs a real wallet extension, so Task 8 Step 3 walks it by hand. The activity feed and history come from the mock and will move to an event indexer at the backend stage, which is why `listActivity` already exists on the interface.

**Type consistency.** `Side` is `"Above" | "Below"` everywhere; the contract enum order lives only in `SIDE_INDEX`. `MarketStatus` is `"Open" | "Locked" | "Settled" | "Void"` everywhere, matching `STATUS_BY_INDEX`. All USDG amounts are `bigint` in base units and only ever become strings through `formatUsdg`. `RecessClient` has ten methods and both adapters implement exactly those ten. `resolveAction` is the single source of the stake button's label and disabled state.
