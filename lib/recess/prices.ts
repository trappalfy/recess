import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { REFERENCE_FEEDS } from "./config";

/** Reference prices for one ticker over one weekend, in dollars. */
export type ReferencePrices = {
  /** Feed value in effect at the Friday close; null while the close is still ahead. */
  fridayClose: number | null;
  last: number;
  /** When the last value was written, ms. */
  lastAt: number;
  /** First fresh print after the lock; null until the feed has one. */
  settle: number | null;
  /** When that print was written, ms. */
  settleAt: number | null;
};

export interface PriceSource {
  load(epoch: { id: string; openTime: number; lockTime: number }): Promise<Record<string, ReferencePrices>>;
}

/** One round of a feed's current phase. Rounds are numbered from 1, in time order. */
export type Round = { agg: number; answer: bigint; updatedAt: number };
export type RoundReader = (agg: number) => Promise<Round>;

const SCAN = 8;

/** The round in effect at moment t: the last one written at or before it. */
export async function lastAtOrBefore(read: RoundReader, latest: number, t: number): Promise<Round | null> {
  let lo = 1;
  let hi = latest;
  let best: Round | null = null;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const r = await read(mid);
    if (r.updatedAt <= t) {
      best = r;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

/**
 * Update §3.1: the first fresh print after moment t. Outside market hours the
 * feed rewrites the value it held on its heartbeat, so a round that repeats the
 * value in effect at t is not a fresh print and is skipped. The value in effect
 * at the lock can differ from the 4:00 PM close, after Friday's late trading.
 */
export async function firstFreshAfter(
  read: RoundReader,
  latest: number,
  t: number,
  atT: bigint | null,
): Promise<Round | null> {
  let lo = 1;
  let hi = latest;
  let first = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const r = await read(mid);
    if (r.updatedAt > t) {
      first = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  if (!first) return null;
  for (let n = first; n <= latest; n += SCAN) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(SCAN, latest - n + 1) }, (_, i) => read(n + i)),
    );
    const fresh = batch.find((r) => atT === null || r.answer !== atT);
    if (fresh) return fresh;
  }
  return null;
}

const ROUND_OUTPUTS = [
  { name: "roundId", type: "uint80" },
  { name: "answer", type: "int256" },
  { name: "startedAt", type: "uint256" },
  { name: "updatedAt", type: "uint256" },
  { name: "answeredInRound", type: "uint80" },
] as const;

const FEED_ABI = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { type: "function", name: "latestRoundData", stateMutability: "view", inputs: [], outputs: ROUND_OUTPUTS },
  {
    type: "function",
    name: "getRoundData",
    stateMutability: "view",
    inputs: [{ name: "_roundId", type: "uint80" }],
    outputs: ROUND_OUTPUTS,
  },
] as const;

const AGG_MASK = (1n << 64n) - 1n;
const TTL_MS = 60_000;
const CACHE_KEY = "recess-reference-v2";
const CACHED_WEEKENDS = 6;

type Address = `0x${string}`;
type Latest = { phase: bigint; agg: number; answer: bigint; updatedAt: number; decimals: number };
/** Per weekend and ticker, the close and the first print once known. History does not change. */
type Cache = Record<string, Record<string, { close?: string; settle?: string; settleAt?: number }>>;

const makeClient = (url: string) =>
  createPublicClient({ chain: arbitrum, transport: http(url, { batch: true }), batch: { multicall: true } });

/**
 * Update §3.1: the Chainlink reference feed per ticker, read straight from the
 * browser on Arbitrum One through the RPC in env. No server sits in between.
 * Concurrent reads are folded into multicalls. Latest values are kept for a
 * minute; a Friday close or a first print never changes once found, so it is
 * kept in localStorage.
 */
export class ChainlinkPrices implements PriceSource {
  private readonly client: ReturnType<typeof makeClient>;
  private readonly storage: Storage | null;
  private readonly now: () => number;
  private readonly rounds = new Map<string, Promise<Round>>();
  private readonly decimals = new Map<string, Promise<number>>();
  private readonly loads = new Map<string, { at: number; data: Promise<Record<string, ReferencePrices>> }>();

  constructor(url: string, storage: Storage | null = null, now: () => number = Date.now) {
    this.client = makeClient(url);
    this.storage = storage;
    this.now = now;
  }

  load(epoch: { id: string; openTime: number; lockTime: number }): Promise<Record<string, ReferencePrices>> {
    const hit = this.loads.get(epoch.id);
    if (hit && this.now() - hit.at < TTL_MS) return hit.data;
    const data = this.fetch(epoch);
    this.loads.set(epoch.id, { at: this.now(), data });
    data.catch(() => this.loads.delete(epoch.id));
    return data;
  }

  private async fetch(epoch: { id: string; openTime: number; lockTime: number }) {
    const now = this.now();
    const latest = await this.latestAll();
    const cache = this.readCache();
    const known = (cache[epoch.id] ??= {});
    const out: Record<string, ReferencePrices> = {};

    await Promise.all(
      Object.entries(REFERENCE_FEEDS).map(async ([ticker, feed]) => {
        const l = latest.get(ticker)!;
        const scale = 10 ** l.decimals;
        const read: RoundReader = (agg) => this.round(feed, l.phase, agg);
        const mine = (known[ticker] ??= {});

        let close: bigint | null = null;
        if (epoch.openTime <= now) {
          if (mine.close) close = BigInt(mine.close);
          else {
            close = (await lastAtOrBefore(read, l.agg, epoch.openTime))?.answer ?? null;
            if (close !== null) mine.close = close.toString();
          }
        }

        let settle: { answer: bigint; at: number } | null = null;
        if (epoch.lockTime <= now) {
          if (mine.settle && mine.settleAt) settle = { answer: BigInt(mine.settle), at: mine.settleAt };
          else {
            const atLock = await lastAtOrBefore(read, l.agg, epoch.lockTime);
            const r = await firstFreshAfter(read, l.agg, epoch.lockTime, atLock?.answer ?? null);
            if (r) {
              settle = { answer: r.answer, at: r.updatedAt };
              mine.settle = r.answer.toString();
              mine.settleAt = r.updatedAt;
            }
          }
        }

        out[ticker] = {
          fridayClose: close === null ? null : Number(close) / scale,
          last: Number(l.answer) / scale,
          lastAt: l.updatedAt,
          settle: settle === null ? null : Number(settle.answer) / scale,
          settleAt: settle?.at ?? null,
        };
      }),
    );

    this.writeCache(cache);
    return out;
  }

  private async latestAll(): Promise<Map<string, Latest>> {
    const entries = await Promise.all(
      Object.entries(REFERENCE_FEEDS).map(async ([ticker, feed]) => {
        const [decimals, [roundId, answer, , updatedAt]] = await Promise.all([
          this.decimalsOf(feed),
          this.client.readContract({ address: feed, abi: FEED_ABI, functionName: "latestRoundData" }),
        ]);
        const latest: Latest = {
          phase: roundId >> 64n,
          agg: Number(roundId & AGG_MASK),
          answer,
          updatedAt: Number(updatedAt) * 1000,
          decimals,
        };
        return [ticker, latest] as const;
      }),
    );
    return new Map(entries);
  }

  private decimalsOf(feed: Address): Promise<number> {
    let d = this.decimals.get(feed);
    if (!d) {
      d = this.client.readContract({ address: feed, abi: FEED_ABI, functionName: "decimals" }).then(Number);
      this.decimals.set(feed, d);
      d.catch(() => this.decimals.delete(feed));
    }
    return d;
  }

  private round(feed: Address, phase: bigint, agg: number): Promise<Round> {
    const key = `${feed}:${phase}:${agg}`;
    let r = this.rounds.get(key);
    if (!r) {
      r = this.client
        .readContract({ address: feed, abi: FEED_ABI, functionName: "getRoundData", args: [(phase << 64n) | BigInt(agg)] })
        .then(([, answer, , updatedAt]) => ({ agg, answer, updatedAt: Number(updatedAt) * 1000 }));
      this.rounds.set(key, r);
      r.catch(() => this.rounds.delete(key));
    }
    return r;
  }

  private readCache(): Cache {
    try {
      const raw = this.storage?.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as Cache) : {};
    } catch {
      return {};
    }
  }

  private writeCache(cache: Cache) {
    for (const old of Object.keys(cache).sort().slice(0, -CACHED_WEEKENDS)) delete cache[old];
    try {
      this.storage?.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* storage blocked or full: history is read again next time */
    }
  }
}
