import type { Market, Position, Activity, Side, TxResult, TxOptions } from "./types";
import type { Epoch } from "./schedule";
import type { RecessClient } from "./client";

const TODO = (what: string): never => {
  throw new Error(`ChainClient.${what} is not implemented: contracts are the next stage.`);
};

/**
 * Contract-backed adapter. Deliberately empty: update §preamble puts contracts
 * in the next stage, and getClient only picks this once a markets address is set.
 * TODO(contracts): read and write through wagmi/viem with RECESS_MARKETS_ABI and ENV.marketsAddress.
 * TODO(indexer): listActivity needs an event indexer.
 */
export class ChainClient implements RecessClient {
  async getEpoch(): Promise<Epoch> { return TODO("getEpoch"); }
  async listMarkets(_epochId: string): Promise<Market[]> { return TODO("listMarkets"); }
  async getMarket(_epochId: string, _ticker: string): Promise<Market | null> { return TODO("getMarket"); }
  async getPositions(_address: `0x${string}`): Promise<Position[]> { return TODO("getPositions"); }
  async listActivity(_marketId: string): Promise<Activity[]> { return TODO("listActivity"); }
  async stake(_marketId: string, _side: Side, _amount: bigint, _opts?: TxOptions): Promise<TxResult> { return TODO("stake"); }
  async claim(_marketId: string, _opts?: TxOptions): Promise<TxResult> { return TODO("claim"); }
  async approveUsdg(_amount: bigint, _opts?: TxOptions): Promise<TxResult> { return TODO("approveUsdg"); }
  async getAllowance(_address: `0x${string}`): Promise<bigint> { return TODO("getAllowance"); }
  async getUsdgBalance(_address: `0x${string}`): Promise<bigint> { return TODO("getUsdgBalance"); }
  /** TODO(contracts): watch Staked, Settled, Voided and Claimed events and new blocks. */
  subscribe(_onChange: () => void): () => void { return () => {}; }
}
