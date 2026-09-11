"use client";

import { useCallback, useState } from "react";
import type { TxOptions, TxResult } from "@/lib/recess/types";
import { CONTRACT_ACTIONS_ENABLED, ENV, isMock } from "@/lib/recess/config";
import { txErrorMessage } from "@/lib/recess/action-state";
import { useToast } from "./Toast";

/** A demo hash exists on no chain, so mock mode links to no explorer. */
function txUrl(hash: `0x${string}`): string | undefined {
  if (isMock() || !ENV.explorerUrl) return undefined;
  return `${ENV.explorerUrl.replace(/\/+$/, "")}/tx/${hash}`;
}

/**
 * Update §5's transaction toasts in one place: `Confirming…` with an explorer
 * link once the wallet signs, the success message on confirmation, and the
 * reason on rejection or failure. Every button that would sign a transaction
 * goes through here, so CONTRACT_ACTIONS_ENABLED switches them all.
 */
export function useTx() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (send: (opts: TxOptions) => Promise<TxResult>, success: string): Promise<boolean> => {
      // Owner decision: until contracts exist, pressing such a button does nothing.
      if (!CONTRACT_ACTIONS_ENABLED) return false;
      let pendingToast = 0;
      setPending(true);
      try {
        const { hash } = await send({
          onSubmitted: (h) => {
            pendingToast = toast.push(isMock() ? "Confirming demo transaction…" : "Confirming…", {
              tone: "pending",
              href: txUrl(h),
            });
          },
        });
        toast.push(success, { href: txUrl(hash) });
        return true;
      } catch (err) {
        toast.push(txErrorMessage(err), { tone: "error" });
        return false;
      } finally {
        if (pendingToast) toast.dismiss(pendingToast);
        setPending(false);
      }
    },
    [toast],
  );

  return { pending, run };
}
