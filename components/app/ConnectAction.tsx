"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ACTION_BTN } from "./styles";

/** The panel's action button while no wallet is connected: it opens the connect modal. */
export function ConnectAction({ label = "Connect wallet" }: { label?: string }) {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <button type="button" data-testid="stake-action" onClick={openConnectModal} className={ACTION_BTN}>
          {label}
        </button>
      )}
    </ConnectButton.Custom>
  );
}
