import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { custom } from "viem";
import { createConfig, http } from "wagmi";
import { robinhoodChain } from "./chain";
import { demoWallet } from "./demo-wallet";
import { ENV, isMock } from "@/lib/recess/config";

/**
 * Built by hand rather than through getDefaultConfig, which bundles the Coinbase
 * Base Account connector and always initialises WalletConnect. Without a real
 * project id WalletConnect calls out to reown.com and is refused, so it only
 * joins the list once one is present in env.
 */
const wallets = ENV.walletConnectId
  ? [injectedWallet, walletConnectWallet]
  : [injectedWallet];

/** In mock mode the demo wallet comes first, in a group of its own. */
const groups = [
  ...(isMock() ? [{ groupName: "Demo", wallets: [demoWallet] }] : []),
  { groupName: "Wallets", wallets },
];

const connectors = connectorsForWallets(groups, {
  appName: "Recess",
  projectId: ENV.walletConnectId || "recess-local",
});

/**
 * With no RPC in env (mock mode, or before env is filled in) chain reads fail at
 * once, instead of calling out to the chain definition's localhost placeholder.
 */
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
