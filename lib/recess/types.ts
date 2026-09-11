export type Side = "Above" | "Below";
export type MarketStatus = "Open" | "Locked" | "Settled" | "Void";

/** Field names mirror the draft contract interface (update §6), so the chain adapter maps one to one. */
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
  /**
   * The fields below describe where the prices come from, so the UI can say so.
   * They are not part of the contract's market struct.
   */
  /** Chainlink reference feeds, or demo seeds when the feeds cannot be read. */
  priceSource: "chainlink" | "demo";
  /** When the last price was written, ms; null for demo prices. */
  priceAt: number | null;
  /** Friday's close is still ahead, so fridayClose holds the latest price for now. */
  closeProvisional: boolean;
  /** The settle print was made up by the demo controls rather than read from the feed. */
  settleSimulated: boolean;
  /** When the feed wrote the settle print, ms; null until there is one, or when simulated. */
  settleAt: number | null;
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

/**
 * A transaction has a hash as soon as the wallet signs it and confirms later.
 * Update §5 shows `Confirming…` with an explorer link in between, so the
 * write methods report the hash here before their promise resolves.
 */
export type TxOptions = { onSubmitted?: (hash: `0x${string}`) => void };
