import type { Market, Position, Activity, Side, TxResult, TxOptions } from "./types";
import type { Epoch } from "./schedule";
import { ENV } from "./config";
import { ChainClient } from "./chain";
import { ChainlinkPrices } from "./prices";

/**
 * Update §6: every screen talks to this interface and never to a chain directly,
 * so the contract stage fills in the adapter without touching the UI.
 */
export interface RecessClient {
  getEpoch(): Promise<Epoch>;
  listMarkets(epochId: string): Promise<Market[]>;
  getMarket(epochId: string, ticker: string): Promise<Market | null>;
  getPositions(address: `0x${string}`): Promise<Position[]>;
  /** Recent stakes. An event indexer serves this at the backend stage. */
  listActivity(marketId: string): Promise<Activity[]>;
  stake(marketId: string, side: Side, amount: bigint, opts?: TxOptions): Promise<TxResult>;
  claim(marketId: string, opts?: TxOptions): Promise<TxResult>;
  approveUsdg(amount: bigint, opts?: TxOptions): Promise<TxResult>;
  /** USDG already approved to the markets contract; null while there is no contract to approve. */
  getAllowance(address: `0x${string}`): Promise<bigint | null>;
  getUsdgBalance(address: `0x${string}`): Promise<bigint>;
  /** Calls back whenever anything the screens read may have changed. Returns an unsubscribe. */
  subscribe(onChange: () => void): () => void;
}

let cached: RecessClient | null = null;

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function getClient(): RecessClient {
  if (!cached) cached = new ChainClient({ prices: new ChainlinkPrices(ENV.priceRpcUrl, browserStorage()) });
  return cached;
}
