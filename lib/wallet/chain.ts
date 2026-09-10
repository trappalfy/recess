import { defineChain } from "viem";
import { ENV } from "@/lib/recess/config";

/**
 * Corrective brief section 5: every network value comes from env, nothing hardcoded.
 * The localhost fallback exists only so the app boots before env is filled in; it is
 * never a claim about Robinhood Chain, and mock mode never calls it.
 */
const DEV_FALLBACK_RPC = "http://127.0.0.1:8545";

export const robinhoodChain = defineChain({
  id: ENV.chainId || 1,
  name: ENV.chainName,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [ENV.rpcUrl || DEV_FALLBACK_RPC] } },
  ...(ENV.explorerUrl
    ? { blockExplorers: { default: { name: "Explorer", url: ENV.explorerUrl } } }
    : {}),
});
