import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { custom } from "viem";
import { createConfig, http } from "wagmi";
import { robinhoodChain } from "./chain";
import { ENV } from "@/lib/recess/config";

/**
 * Built by hand rather than through getDefaultConfig, which bundles the Coinbase
 * Base Account connector and always initialises WalletConnect. Browser wallets
 * connect through the injected provider, and wagmi also lists every extension
 * that announces itself (EIP-6963). WalletConnect joins once a project id is in env.
 */
const wallets = ENV.walletConnectId
  ? [injectedWallet, walletConnectWallet]
  : [injectedWallet];

const connectors = connectorsForWallets([{ groupName: "Wallets", wallets }], {
  appName: "Recess",
  projectId: ENV.walletConnectId || "recess-local",
});

/** With no RPC in env, chain reads fail at once instead of calling a placeholder. */
const noRpc = custom({
  request: async () => {
    throw new Error("No RPC URL is configured.");
  },
});

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors,
  transports: { [robinhoodChain.id]: ENV.rpcUrl ? http(ENV.rpcUrl) : noRpc },
  ssr: true,
});
