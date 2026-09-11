"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const KEY = "recess-jurisdiction-ack";

/**
 * Update §8: on first entry to the app the visitor confirms they are outside the
 * United States and other restricted jurisdictions and understand the risks.
 * The acknowledgement is kept locally. The wording is a placeholder for counsel.
 */
export function LegalGate() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const boxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(KEY) !== "1");
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    boxRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked: the gate returns next visit */
    }
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[rgba(1,3,32,.45)] px-4 py-6"
    >
      <div className="w-full max-w-[520px] rounded-[32px] border border-line bg-white p-7 sm:p-9">
        <h2
          id="gate-title"
          className="text-ink"
          style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 28, lineHeight: 1.2 }}
        >
          Before you continue
        </h2>
        <p className="mt-4 text-body" style={{ fontFamily: "var(--font-inter)", fontSize: 16, lineHeight: 1.5 }}>
          Placeholder text pending legal review. Recess is not affiliated with Robinhood Markets and is not
          available in the United States or other restricted jurisdictions. Staking on a market puts funds at
          risk, and outcomes are settled from a reference price feed. See the{" "}
          <Link href="/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          and the{" "}
          <Link href="/risk" className="underline underline-offset-4">
            Risk disclosure
          </Link>
          .
        </p>

        <label
          className="mt-6 flex cursor-pointer items-start gap-3 text-ink"
          style={{ fontFamily: "var(--font-inter)", fontSize: 15, lineHeight: 1.5 }}
        >
          <input
            ref={boxRef}
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#0A68F5]"
          />
          I am not located in the United States or another restricted jurisdiction, and I understand the risks.
        </label>

        <button
          type="button"
          disabled={!checked}
          onClick={accept}
          className="mt-7 h-[52px] w-full rounded-full bg-ink text-white transition-colors duration-200 enabled:hover:bg-[#0D1238] disabled:opacity-40"
          style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18 }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
