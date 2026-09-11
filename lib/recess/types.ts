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
  /**
   * The latest reference price, shown for information. Update §3.1 puts the
   * token's DEX pool price here; there is no Recess pool yet, so the feed stands in.
   */
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
  /* The three below come from the reference feed, not the contract's market struct. */
  /** When the latest price was written, ms. */
  priceAt: number;
  /** The feed had no value at Friday's close, so fridayClose holds the latest price instead. */
  closeProvisional: boolean;
  /** When the feed wrote the settle print, ms; null until there is one. */
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
