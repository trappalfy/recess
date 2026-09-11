import type { Side, MarketStatus } from "./types";
import { usdgToInput } from "./format";

export type ActionKind =
  | "connect" | "switch" | "amount" | "balance"
  | "approve" | "stake" | "pending" | "closed";

export type Action = { kind: ActionKind; label: string; disabled: boolean };

export type ActionInput = {
  status: MarketStatus;
  connected: boolean;
  rightNetwork: boolean;
  amount: bigint;
  /** The wallet's USDG; null when it could not be read, and then no balance claim is made. */
  balance: bigint | null;
  /** USDG approved to the markets contract; null while there is no contract, so no approval step. */
  allowance: bigint | null;
  /** Base units; update §10 leaves the value to agree, config holds it. */
  minStake: bigint;
  side: Side;
  pending: boolean;
};

/**
 * The stake button, update §5, evaluated in the order the brief lists. The
 * market state is the outer fact: a locked market says so even to a visitor
 * with no wallet. The minimum stake (update §10) sits with `Enter an amount`.
 */
export function resolveAction(i: ActionInput): Action {
  if (i.status !== "Open") {
    return { kind: "closed", label: "Betting is closed. Settles at the open.", disabled: true };
  }
  if (i.pending) return { kind: "pending", label: "Confirming…", disabled: true };
  if (!i.connected) return { kind: "connect", label: "Connect wallet", disabled: false };
  if (!i.rightNetwork) return { kind: "switch", label: "Switch network", disabled: false };
  if (i.amount <= 0n) return { kind: "amount", label: "Enter an amount", disabled: true };
  if (i.amount < i.minStake) {
    return { kind: "amount", label: `Minimum stake is ${usdgToInput(i.minStake)} USDG`, disabled: true };
  }
  if (i.balance !== null && i.amount > i.balance) {
    return { kind: "balance", label: "Not enough USDG in your wallet", disabled: true };
  }
  if (i.allowance !== null && i.allowance < i.amount) {
    return { kind: "approve", label: "Approve USDG", disabled: false };
  }
  return { kind: "stake", label: `Stake on ${i.side}`, disabled: false };
}

type ErrorLike = { code?: unknown; name?: unknown; message?: unknown; cause?: unknown };

/**
 * Update §5's two failure toasts. viem wraps a wallet rejection several
 * layers deep, so the cause chain is walked; EIP-1193 code 4001 is the rejection.
 */
export function txErrorMessage(err: unknown): string {
  let e: unknown = err;
  for (let depth = 0; depth < 6 && e && typeof e === "object"; depth++) {
    const x = e as ErrorLike;
    if (
      x.code === 4001 ||
      x.name === "UserRejectedRequestError" ||
      (typeof x.message === "string" && /rejected|denied/i.test(x.message))
    ) {
      return "Transaction rejected in wallet";
    }
    e = x.cause;
  }
  return "Transaction failed. Try again.";
}
