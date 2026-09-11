import { createPublicClient, erc20Abi, http } from "viem";
import type { Market, Position, Activity, Side, TxResult, TxOptions } from "./types";
import { epochAt, type Epoch } from "./schedule";
import { ENV, RECESS_CONFIG, contractsLive } from "./config";
import type { RecessClient } from "./client";
import type { PriceSource, ReferencePrices } from "./prices";
import { robinhoodChain } from "@/lib/wallet/chain";

const NOT_LIVE = "The Recess contracts are not live yet.";

/**
 * One market from the schedule and its reference feed. Open until the lock,
 * Locked until the feed's first fresh print, then Settled on the side that
 * print landed, or Void when it landed on the close (update §3.4).
 * TODO(contracts): pools come from market(marketId); until the contracts are
 * live nothing has been staked, so they are empty, and the empty-side void rule
 * is the contract's to enforce.
 */
export function marketFrom(ticker: string, epoch: Epoch, ref: ReferencePrices, now: number): Market {
  const fridayClose = ref.fridayClose ?? ref.last;
  const market: Market = {
    id: `${epoch.id}:${ticker}`,
    epochId: epoch.id,
    ticker,
    fridayClose,
    poolPrice: ref.last,
    poolAbove: 0n,
    poolBelow: 0n,
    status: "Open",
    settlePrice: null,
    winner: null,
    openTime: epoch.openTime,
    lockTime: epoch.lockTime,
    priceAt: ref.lastAt,
    closeProvisional: ref.fridayClose === null,
    settleAt: null,
  };
  if (now < epoch.lockTime) return market;
  if (ref.settle === null) return { ...market, status: "Locked" };
  const settled = { ...market, settlePrice: ref.settle, settleAt: ref.settleAt };
  if (ref.settle === fridayClose) return { ...settled, status: "Void" };
  return { ...settled, status: "Settled", winner: ref.settle > fridayClose ? "Above" : "Below" };
}

const scheduleStatus = (epoch: Epoch, now: number): Epoch["status"] => (now < epoch.lockTime ? "Open" : "Locked");

/**
 * The real adapter (update §6). The weekend comes from the schedule, prices
 * from the Chainlink reference feeds, and the wallet's USDG from Robinhood
 * Chain through the RPC in env. Everything the contracts will hold (pools,
 * positions, allowance) reads as empty until a markets address is set.
 * TODO(contracts): read and write through RECESS_MARKETS_ABI at ENV.marketsAddress.
 * TODO(indexer): listActivity needs an event indexer.
 */
export class ChainClient implements RecessClient {
  private readonly prices: PriceSource;
  private readonly now: () => number;
  private readonly rpc = createPublicClient({ chain: robinhoodChain, transport: http(ENV.rpcUrl || undefined) });

  constructor(opts: { prices: PriceSource; now?: () => number }) {
    this.prices = opts.prices;
    this.now = opts.now ?? Date.now;
  }

  private async board(): Promise<{ epoch: Epoch; markets: Market[] }> {
    const now = this.now();
    const epoch = epochAt(now);
    const refs = await this.prices.load(epoch);
    const markets = RECESS_CONFIG.tickers.map((ticker) => marketFrom(ticker, epoch, refs[ticker], now));
    const printed = markets.some((m) => m.settlePrice !== null);
    const status = now < epoch.lockTime ? "Open" : printed ? "Settled" : "Locked";
    return { epoch: { ...epoch, status }, markets };
  }

  async getEpoch(): Promise<Epoch> {
    try {
      return (await this.board()).epoch;
    } catch {
      // The weekend and its lock are known from the schedule alone.
      const epoch = epochAt(this.now());
      return { ...epoch, status: scheduleStatus(epoch, this.now()) };
    }
  }

  async listMarkets(epochId: string): Promise<Market[]> {
    const { epoch, markets } = await this.board();
    return epoch.id === epochId ? markets : [];
  }

  async getMarket(epochId: string, ticker: string): Promise<Market | null> {
    const wanted = ticker.toUpperCase();
    return (await this.listMarkets(epochId)).find((m) => m.ticker === wanted) ?? null;
  }

  /** TODO(contracts): positionOf(marketId, address) for every market of the weekend. */
  async getPositions(_address: `0x${string}`): Promise<Position[]> {
    return [];
  }

  async listActivity(_marketId: string): Promise<Activity[]> {
    return [];
  }

  async getUsdgBalance(address: `0x${string}`): Promise<bigint> {
    if (!ENV.usdgAddress) throw new Error("NEXT_PUBLIC_USDG_ADDRESS is not set.");
    return this.rpc.readContract({
      address: ENV.usdgAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
  }

  async getAllowance(address: `0x${string}`): Promise<bigint | null> {
    if (!contractsLive() || !ENV.usdgAddress) return null;
    return this.rpc.readContract({
      address: ENV.usdgAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, ENV.marketsAddress as `0x${string}`],
    });
  }

  async stake(_marketId: string, _side: Side, _amount: bigint, _opts?: TxOptions): Promise<TxResult> {
    throw new Error(NOT_LIVE);
  }

  async claim(_marketId: string, _opts?: TxOptions): Promise<TxResult> {
    throw new Error(NOT_LIVE);
  }

  async approveUsdg(_amount: bigint, _opts?: TxOptions): Promise<TxResult> {
    throw new Error(NOT_LIVE);
  }

  /** TODO(contracts): watch Staked, Settled, Voided and Claimed events. Screens poll each minute meanwhile. */
  subscribe(_onChange: () => void): () => void {
    return () => {};
  }
}
