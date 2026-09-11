import type { Market, Position, Activity, Side, TxResult, TxOptions, MarketStatus } from "./types";
import { epochAt, type Epoch } from "./schedule";
import { RECESS_CONFIG } from "./config";
import type { RecessClient } from "./client";

/** The demo wallet. In mock mode every connected address sees its positions and balance. */
export const DEMO_USER = "0x1111111111111111111111111111111111111111" as const;

/** What the demo controls can make the next transaction do instead of confirming. */
export type MockFailure = "reject" | "fail";

const TX_DELAY_MS = 1500;
const STORAGE_KEY = "recess-demo-state";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const BPS = 10_000n;
const SCALE = 10 ** RECESS_CONFIG.usdgDecimals;
const usdg = (n: number) => BigInt(Math.round(n * SCALE));
const round2 = (n: number) => Math.round(n * 100) / 100;
const START_BALANCE = usdg(5000);

type Stake = { above: bigint; below: bigint };

/** Everything the demo wallet has changed. The rest of the board is derived from seeds. */
type State = {
  v: 1;
  /** Friday open of the weekend the demo runs on. */
  epochOpen: number;
  /** Stage set by the demo controls; null follows the schedule. */
  forced: MarketStatus | null;
  failNext: MockFailure | null;
  balance: bigint;
  allowance: bigint;
  stakes: Record<string, Stake>;
  claimed: string[];
  activity: Activity[];
};

type Seed = {
  ticker: string;
  fridayClose: number;
  poolPrice: number;
  poolAbove: bigint;
  poolBelow: bigint;
  /** The first print after the weekend, used once the market settles. */
  settle: number;
  activity: Activity[];
};

function seeded(key: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex = (length: number, rnd: () => number) =>
  Array.from({ length }, () => Math.floor(rnd() * 16).toString(16)).join("");

/** JSON has no bigint, so amounts travel as tagged strings. */
const toJson = (state: State) =>
  JSON.stringify(state, (_k, v) => (typeof v === "bigint" ? { $n: v.toString() } : v));
const fromJson = (raw: string): State =>
  JSON.parse(raw, (_k, v) => (v && typeof v === "object" && typeof v.$n === "string" ? BigInt(v.$n) : v));

function payoutOf(market: Market, stake: Stake): bigint | null {
  if (market.status === "Void") return stake.above + stake.below;
  if (market.status !== "Settled" || !market.winner) return null;
  const staked = market.winner === "Above" ? stake.above : stake.below;
  const winningPool = market.winner === "Above" ? market.poolAbove : market.poolBelow;
  const net = ((market.poolAbove + market.poolBelow) * (BPS - BigInt(RECESS_CONFIG.feeBps))) / BPS;
  return (staked * net) / winningPool;
}

/**
 * Update §6: deterministic demo data and simulated transactions that confirm
 * after 1.5s. Pools, prices and the settlement print come from a generator
 * seeded on the weekend and ticker, so every reload and every machine shows
 * the same board; only the demo wallet's own stakes are stored.
 */
export class MockClient implements RecessClient {
  private readonly instant: boolean;
  private readonly now: () => number;
  private readonly storage: Storage | null;
  private readonly listeners = new Set<() => void>();
  private seeds: { epochId: string; list: Seed[] } | null = null;
  private state: State;
  private nonce = 0;

  constructor(opts: { instant?: boolean; now?: () => number; storage?: Storage | null } = {}) {
    this.instant = opts.instant ?? false;
    this.now = opts.now ?? Date.now;
    this.storage = opts.storage ?? null;
    this.state = this.load();
  }

  /* ---------- state ---------- */

  private fresh(epochOpen: number, balance = START_BALANCE): State {
    return {
      v: 1, epochOpen, forced: null, failNext: null, balance, allowance: 0n,
      stakes: {}, claimed: [], activity: [],
    };
  }

  private load(): State {
    const current = epochAt(this.now()).openTime;
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (raw) {
        const saved = fromJson(raw);
        // A newer weekend has begun for real since this was saved: start over.
        if (saved.v === 1 && saved.epochOpen >= current) return saved;
      }
    } catch {
      /* unreadable storage: start fresh */
    }
    return this.fresh(current);
  }

  private commit() {
    try {
      this.storage?.setItem(STORAGE_KEY, toJson(this.state));
    } catch {
      /* storage blocked or full: the demo carries on in memory */
    }
    for (const fn of this.listeners) fn();
  }

  /* ---------- derived board ---------- */

  private weekend(): Epoch {
    return epochAt(this.state.epochOpen + 60_000);
  }

  /** The stage every market is in: forced by the demo controls, or from the schedule. */
  stage(): MarketStatus {
    return this.state.forced ?? (this.now() < this.weekend().lockTime ? "Open" : "Locked");
  }

  private seedList(): Seed[] {
    const e = this.weekend();
    if (this.seeds?.epochId === e.id) return this.seeds.list;
    // Recent stakes sit before now, spread over the time the board has been open;
    // a board opened early by the demo controls gets the last few hours.
    const end = Math.min(this.now(), e.lockTime);
    const span = Math.min(30 * HOUR, Math.max(4 * HOUR, end - e.openTime));
    const list = RECESS_CONFIG.tickers.map((ticker): Seed => {
      const rnd = seeded(`${e.id}:${ticker}`);
      const id = `${e.id}:${ticker}`;
      const fridayClose = round2(40 + rnd() * 260);
      return {
        ticker,
        fridayClose,
        poolPrice: round2(fridayClose * (1 + (rnd() - 0.5) * 0.06)),
        settle: round2(fridayClose * (1 + (rnd() - 0.5) * 0.08)),
        poolAbove: usdg(Math.round(2000 + rnd() * 18000)),
        poolBelow: usdg(Math.round(2000 + rnd() * 18000)),
        activity: Array.from({ length: 6 }, (_, i) => ({
          id: `${id}:seed${i}`,
          marketId: id,
          side: (rnd() < 0.5 ? "Above" : "Below") as Side,
          amount: usdg(Math.round(50 + rnd() * 900)),
          at: end - Math.floor(rnd() * span),
          user: `0x${hex(40, rnd)}` as `0x${string}`,
        })),
      };
    });
    this.seeds = { epochId: e.id, list };
    return list;
  }

  private build(seed: Seed): Market {
    const e = this.weekend();
    const id = `${e.id}:${seed.ticker}`;
    const mine = this.state.stakes[id];
    const poolAbove = seed.poolAbove + (mine?.above ?? 0n);
    const poolBelow = seed.poolBelow + (mine?.below ?? 0n);
    const market: Market = {
      id, epochId: e.id, ticker: seed.ticker,
      fridayClose: seed.fridayClose, poolPrice: seed.poolPrice,
      poolAbove, poolBelow,
      status: "Open", settlePrice: null, winner: null,
      openTime: e.openTime, lockTime: e.lockTime,
    };
    const stage = this.stage();
    if (stage === "Open" || stage === "Locked") return { ...market, status: stage };
    // Update §3.4. A forced void plays the first print landing on the close.
    if (stage === "Void") return { ...market, status: "Void", settlePrice: seed.fridayClose };
    if (poolAbove === 0n || poolBelow === 0n || seed.settle === seed.fridayClose) {
      return { ...market, status: "Void", settlePrice: seed.settle };
    }
    return {
      ...market,
      status: "Settled",
      settlePrice: seed.settle,
      winner: seed.settle > seed.fridayClose ? "Above" : "Below",
    };
  }

  private markets(): Market[] {
    return this.seedList().map((seed) => this.build(seed));
  }

  private positions(): Position[] {
    const out: Position[] = [];
    for (const market of this.markets()) {
      const stake = this.state.stakes[market.id];
      if (!stake || stake.above + stake.below === 0n) continue;
      out.push({
        marketId: market.id,
        ticker: market.ticker,
        above: stake.above,
        below: stake.below,
        claimed: this.state.claimed.includes(market.id),
        status: market.status,
        winner: market.winner,
        payout: payoutOf(market, stake),
      });
    }
    return out;
  }

  /* ---------- transactions ---------- */

  /**
   * The wallet signs at once and the chain confirms 1.5s later (update §6).
   * A failure queued by the demo controls happens here, so the error toasts
   * of update §5 can be reproduced.
   */
  private async send(opts: TxOptions | undefined, apply: () => void): Promise<TxResult> {
    const failure = this.state.failNext;
    if (failure) {
      this.state.failNext = null;
      this.commit();
    }
    if (failure === "reject") {
      throw Object.assign(new Error("User rejected the request."), { code: 4001 });
    }
    this.nonce += 1;
    const hash = `0x${hex(64, Math.random)}` as `0x${string}`;
    opts?.onSubmitted?.(hash);
    if (!this.instant) await new Promise((resolve) => setTimeout(resolve, TX_DELAY_MS));
    if (failure === "fail") throw new Error("Transaction reverted.");
    apply();
    this.commit();
    return { hash };
  }

  /* ---------- RecessClient ---------- */

  async getEpoch(): Promise<Epoch> {
    const stage = this.stage();
    return { ...this.weekend(), status: stage === "Void" ? "Settled" : stage };
  }

  async listMarkets(epochId: string): Promise<Market[]> {
    return this.markets().filter((m) => m.epochId === epochId);
  }

  async getMarket(epochId: string, ticker: string): Promise<Market | null> {
    const wanted = ticker.toUpperCase();
    return this.markets().find((m) => m.epochId === epochId && m.ticker === wanted) ?? null;
  }

  async getPositions(_address: `0x${string}`): Promise<Position[]> {
    return this.positions();
  }

  async listActivity(marketId: string): Promise<Activity[]> {
    const seeded = this.seedList().flatMap((s) => s.activity).filter((a) => a.marketId === marketId);
    const mine = this.state.activity.filter((a) => a.marketId === marketId);
    return [...mine, ...seeded].sort((a, b) => b.at - a.at);
  }

  async getUsdgBalance(_address: `0x${string}`): Promise<bigint> {
    return this.state.balance;
  }

  async getAllowance(_address: `0x${string}`): Promise<bigint> {
    return this.state.allowance;
  }

  async approveUsdg(amount: bigint, opts?: TxOptions): Promise<TxResult> {
    if (amount < 0n) throw new Error("Enter an amount");
    return this.send(opts, () => {
      this.state.allowance = amount;
    });
  }

  async stake(marketId: string, side: Side, amount: bigint, opts?: TxOptions): Promise<TxResult> {
    const market = this.markets().find((m) => m.id === marketId);
    if (!market) throw new Error("Unknown market");
    if (market.status !== "Open") throw new Error("Betting is closed on this market: it is locked.");
    if (amount <= 0n) throw new Error("Enter an amount");
    if (amount > this.state.balance) throw new Error("Not enough USDG in your wallet");
    if (amount > this.state.allowance) throw new Error("USDG allowance is too low");
    return this.send(opts, () => {
      const s = this.state;
      const stake = s.stakes[marketId] ?? { above: 0n, below: 0n };
      s.stakes[marketId] =
        side === "Above" ? { ...stake, above: stake.above + amount } : { ...stake, below: stake.below + amount };
      s.balance -= amount;
      s.allowance -= amount;
      s.activity.unshift({
        id: `${marketId}:mine${this.nonce}`, marketId, user: DEMO_USER, side, amount, at: this.now(),
      });
    });
  }

  async claim(marketId: string, opts?: TxOptions): Promise<TxResult> {
    const position = this.positions().find((p) => p.marketId === marketId);
    if (!position) throw new Error("Nothing to claim");
    if (position.claimed) throw new Error("Already claimed");
    if (position.payout === null) throw new Error("This market has not settled yet.");
    if (position.payout === 0n) throw new Error("Nothing to claim");
    const payout = position.payout;
    return this.send(opts, () => {
      this.state.balance += payout;
      this.state.claimed.push(marketId);
    });
  }

  subscribe(onChange: () => void): () => void {
    this.listeners.add(onChange);
    return () => {
      this.listeners.delete(onChange);
    };
  }

  /* ---------- demo controls (update §9); chain mode has no equivalent ---------- */

  /**
   * Fast-forwards the weekend. Opening between weekends opens the next one, the
   * way Friday's close will; opening after settlement starts a fresh round. A
   * fresh round pays out whatever was left unclaimed, so no demo USDG vanishes.
   */
  advanceTo(status: MarketStatus) {
    if (status !== "Open") {
      this.state.forced = status;
      this.commit();
      return;
    }
    const before = this.stage();
    const live = epochAt(this.now());
    const target =
      this.now() < live.lockTime ? live.openTime : epochAt(live.openTime + 7 * DAY + 3 * HOUR).openTime;
    if (target !== this.state.epochOpen || before === "Settled" || before === "Void") {
      const unclaimed = this.positions()
        .filter((p) => !p.claimed)
        .reduce((sum, p) => sum + (p.payout ?? p.above + p.below), 0n);
      this.state = this.fresh(target, this.state.balance + unclaimed);
    }
    this.state.forced = null;
    this.commit();
  }

  setFailNext(failure: MockFailure | null) {
    this.state.failNext = failure;
    this.commit();
  }

  get failNext(): MockFailure | null {
    return this.state.failNext;
  }

  /** Back to an untouched demo wallet on the live weekend. */
  reset() {
    this.state = this.fresh(epochAt(this.now()).openTime);
    this.commit();
  }
}
