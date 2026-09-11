import type { Market, Position, Activity, Side, TxResult, TxOptions } from "./types";
import type { Epoch } from "./schedule";
import { ENV, isMock } from "./config";
import { MockClient } from "./mock";
import { ChainClient } from "./chain";
import { ChainlinkPrices } from "./prices";

/**
 * Update §6: every screen talks to this interface and never to a chain directly,
 * so the contract stage swaps the adapter without touching the UI.
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
  /** USDG allowance already granted to the markets contract. */
  getAllowance(address: `0x${string}`): Promise<bigint>;
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

/**
 * Update §5: mock unless the mode is chain and a markets address is set. The
 * mock reads real prices from the Chainlink reference feeds whenever an RPC for
 * them is set in env.
 */
export function getClient(): RecessClient {
  if (!cached) {
    const storage = browserStorage();
    cached = isMock()
      ? new MockClient({
          storage,
          prices: ENV.priceRpcUrl ? new ChainlinkPrices(ENV.priceRpcUrl, storage) : null,
        })
      : new ChainClient();
  }
  return cached;
}

/** The demo controls reach the mock through this; it is null in chain mode. */
export function getMockClient(): MockClient | null {
  const client = getClient();
  return client instanceof MockClient ? client : null;
}
