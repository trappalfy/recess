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
  /** TO AGREE. Launch ticker list. */
  tickers: ["NVDA", "TSLA", "AAPL", "META", "HIMS"] as const,
  usdgDecimals: 6,
} as const;

export const ENV = {
  mode: process.env.NEXT_PUBLIC_RECESS_MODE ?? "mock",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0),
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME ?? "Robinhood Chain",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL ?? "",
  usdgAddress: process.env.NEXT_PUBLIC_USDG_ADDRESS ?? "",
  marketsAddress: process.env.NEXT_PUBLIC_RECESS_MARKETS_ADDRESS ?? "",
  walletConnectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? "",
} as const;

/** Corrective brief section 6: chain mode needs a markets address, otherwise mock. */
export const isMock = (): boolean => ENV.mode !== "chain" || ENV.marketsAddress === "";
