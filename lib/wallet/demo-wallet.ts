import type { Wallet } from "@rainbow-me/rainbowkit";
import { createConnector } from "wagmi";
import { mock } from "wagmi/connectors";
import { DEMO_USER } from "@/lib/recess/mock";

const KEY = "recess-demo-wallet";

function remembered(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function remember(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the demo wallet simply does not reconnect */
  }
}

/**
 * Mock mode only: a wallet that needs no browser extension, so the walk in
 * update §9 (connect, stake both sides, settle, claim) works on any machine
 * and in the end-to-end tests. It holds the demo address and signs nothing;
 * MockClient simulates every transaction. It never appears in chain mode.
 *
 * wagmi's mock connector keeps its connected flag in memory, so it is stored
 * here: a reload reconnects a visitor who chose the demo wallet, and nobody else.
 */
export const demoWallet = (): Wallet => ({
  id: "recess-demo",
  name: "Demo wallet",
  iconUrl: "/brand/mark.webp",
  iconBackground: "#FFFFFF",
  installed: true,
  createConnector: (walletDetails) =>
    createConnector((config) => {
      const base = mock({
        accounts: [DEMO_USER],
        features: { reconnect: true, defaultConnected: remembered() },
      })(config);
      const connect = async function (this: typeof base, params?: Parameters<typeof base.connect>[0]) {
        const result = await base.connect.call(this, params);
        remember(true);
        return result;
      } as typeof base.connect;
      return {
        ...base,
        ...walletDetails,
        connect,
        async disconnect() {
          await base.disconnect.call(this);
          remember(false);
        },
        // The mock connector asks the chain RPC for eth_accounts, and mock mode has no RPC.
        async getAccounts() {
          return [DEMO_USER];
        },
        async isAuthorized() {
          return remembered();
        },
      };
    }),
});
