/**
 * Values marked TO AGREE are placeholders from corrective brief section 10.
 * They are deliberately conservative and must be confirmed before launch.
 */
export const RECESS_CONFIG = {
  /** TO AGREE. Protocol fee in basis points. */
  feeBps: 200,
  /** TO AGREE. Hours after lock without a fresh reference print before the market voids. */
  voidAfterHours: 12,
  /** TO AGREE. Minimum stake in USDG. */
  minStake: 1,
  /**
   * TO AGREE for launch. Owner decision, 2026-09-11: every ticker with a public
   * Chainlink reference feed (REFERENCE_FEEDS below), so every price is real.
   */
  tickers: ["NVDA", "TSLA", "AAPL", "META", "AMZN", "MSFT", "GOOGL", "COIN"] as const,
  /** USDG on Robinhood Chain reports 6 decimals on chain. */
  usdgDecimals: 6,
} as const;

export type Ticker = (typeof RECESS_CONFIG.tickers)[number];

/**
 * Chainlink reference feed per ticker (update §3.1): the proxy addresses of the
 * equity feeds on Arbitrum One, from Chainlink's data directory, each checked
 * on chain to describe itself as "<TICKER> / USD" with 8 decimals. They stand
 * in until Recess has its own feeds on Robinhood Chain. The RPC that reads them
 * comes from env.
 */
export const REFERENCE_FEEDS: Record<Ticker, `0x${string}`> = {
  NVDA: "0x4881A4418b5F2460B21d6F08CD5aA0678a7f262F",
  TSLA: "0x3609baAa0a9b1f0FE4d6CC01884585d0e191C3E3",
  AAPL: "0x8d0CC5f38f9E802475f2CFf4F9fc7000C2E1557c",
  META: "0xcd1bd86fDc33080DCF1b5715B6FCe04eC6F85845",
  AMZN: "0xd6a77691f071E98Df7217BED98f38ae6d2313EBA",
  MSFT: "0xDde33fb9F21739602806580bdd73BAd831DcA867",
  GOOGL: "0x1D1a83331e9D255EB1Aaf75026B60dFD00A252ba",
  COIN: "0x950DC95D4E537A14283059bADC2734977C454498",
};

/** Update §5: every network value comes from env, nothing is hardcoded. */
export const ENV = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0),
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME ?? "Robinhood Chain",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL ?? "",
  usdgAddress: process.env.NEXT_PUBLIC_USDG_ADDRESS ?? "",
  marketsAddress: process.env.NEXT_PUBLIC_RECESS_MARKETS_ADDRESS ?? "",
  walletConnectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "",
  /** Arbitrum One RPC for REFERENCE_FEEDS. */
  priceRpcUrl: process.env.NEXT_PUBLIC_PRICE_RPC_URL ?? "",
} as const;

/**
 * Owner decision, 2026-09-11: the app runs on real data only, with no demo mode:
 * a real browser wallet, its real USDG balance, real prices. Until the Recess
 * contracts are connected, which is when a markets address is set in env, the
 * pools read as empty and a button that would sign a transaction does nothing.
 */
export const contractsLive = (): boolean => ENV.marketsAddress !== "";
