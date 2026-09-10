import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { robinhoodChain } from "./chain";
import { ENV } from "@/lib/recess/config";

/**
 * Built by hand rather than through getDefaultConfig, which bundles the Coinbase
 * Base Account connector and always initialises WalletConnect. Without a real
 * project id WalletConnect calls out to reown.com and is refused, so it only
 * joins the list once one is present in env.
 */
const wallets = ENV.walletConnectId
  ? [injectedWallet, walletConnectWallet]
  : [injectedWallet];

const connectors = connectorsForWallets([{ groupName: "Wallets", wallets }], {
  appName: "Recess",
  projectId: ENV.walletConnectId || "recess-local",
});

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors,
  transports: { [robinhoodChain.id]: http(ENV.rpcUrl || undefined) },
  ssr: true,
});
