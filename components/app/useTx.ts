"use client";

import { useCallback, useState } from "react";
import type { TxOptions, TxResult } from "@/lib/recess/types";
import { ENV, contractsLive } from "@/lib/recess/config";
import { txErrorMessage } from "@/lib/recess/action-state";
import { useToast } from "./Toast";

function txUrl(hash: `0x${string}`): string | undefined {
  if (!ENV.explorerUrl) return undefined;
  return `${ENV.explorerUrl.replace(/\/+$/, "")}/tx/${hash}`;
}

/**
 * Update §5's transaction toasts in one place: `Confirming…` with an explorer
 * link once the wallet signs, the success message on confirmation, and the
 * reason on rejection or failure. Every button that would sign a transaction
 * goes through here.
 */
export function useTx() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (send: (opts: TxOptions) => Promise<TxResult>, success: string): Promise<boolean> => {
      // Owner decision: until the contracts are connected, pressing such a button does nothing.
      if (!contractsLive()) return false;
      let pendingToast = 0;
      setPending(true);
      try {
        const { hash } = await send({
          onSubmitted: (h) => {
            pendingToast = toast.push("Confirming…", { tone: "pending", href: txUrl(h) });
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
