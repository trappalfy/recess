import { describe, it, expect } from "vitest";
import { resolveAction, txErrorMessage } from "../../lib/recess/action-state";

const base = {
  status: "Open" as const,
  connected: true,
  rightNetwork: true,
  amount: 10_000_000n,
  balance: 100_000_000n as bigint | null,
  allowance: 100_000_000n as bigint | null,
  minStake: 1_000_000n,
  side: "Above" as const,
  pending: false,
};

describe("resolveAction", () => {
  it("closes betting once the market is locked, whatever the wallet does", () => {
    expect(resolveAction({ ...base, status: "Locked", connected: false }))
      .toEqual({ kind: "closed", label: "Betting is closed. Settles at the open.", disabled: true });
  });

  it("asks for a wallet first", () => {
    expect(resolveAction({ ...base, connected: false })).toEqual({
      kind: "connect", label: "Connect wallet", disabled: false,
    });
  });

  it("asks for the right network before anything else", () => {
    expect(resolveAction({ ...base, rightNetwork: false, amount: 0n }).label).toBe("Switch network");
  });

  it("waits for an amount", () => {
    expect(resolveAction({ ...base, amount: 0n }))
      .toEqual({ kind: "amount", label: "Enter an amount", disabled: true });
  });

  it("holds an amount under the minimum stake", () => {
    expect(resolveAction({ ...base, amount: 500_000n }))
      .toEqual({ kind: "amount", label: "Minimum stake is 1 USDG", disabled: true });
  });

  it("refuses an amount above the balance", () => {
    expect(resolveAction({ ...base, amount: 200_000_000n }))
      .toEqual({ kind: "balance", label: "Not enough USDG in your wallet", disabled: true });
  });

  it("makes no balance claim when the balance could not be read", () => {
    expect(resolveAction({ ...base, balance: null, allowance: null, amount: 200_000_000n }).kind).toBe("stake");
  });

  it("asks for approval when the allowance is short", () => {
    expect(resolveAction({ ...base, allowance: 0n })).toEqual({
      kind: "approve", label: "Approve USDG", disabled: false,
    });
  });

  it("skips the approval while there is no contract to approve", () => {
    expect(resolveAction({ ...base, allowance: null })).toEqual({
      kind: "stake", label: "Stake on Above", disabled: false,
    });
  });

  it("names the side it will stake on", () => {
    expect(resolveAction(base).label).toBe("Stake on Above");
    expect(resolveAction({ ...base, side: "Below" }).label).toBe("Stake on Below");
  });

  it("shows progress while a transaction is in flight", () => {
    expect(resolveAction({ ...base, pending: true }))
      .toEqual({ kind: "pending", label: "Confirming…", disabled: true });
  });
});

describe("txErrorMessage", () => {
  it("names a rejection in the wallet", () => {
    expect(txErrorMessage(Object.assign(new Error("User rejected the request."), { code: 4001 })))
      .toBe("Transaction rejected in wallet");
    expect(txErrorMessage({ name: "UserRejectedRequestError", message: "x" }))
      .toBe("Transaction rejected in wallet");
    expect(txErrorMessage(new Error("MetaMask Tx Signature: User denied transaction signature.")))
      .toBe("Transaction rejected in wallet");
  });

  it("falls back to a retry message for everything else", () => {
    expect(txErrorMessage(new Error("Transaction reverted."))).toBe("Transaction failed. Try again.");
    expect(txErrorMessage("boom")).toBe("Transaction failed. Try again.");
  });
});
