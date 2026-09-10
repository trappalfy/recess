"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { epochAt, formatCountdown } from "@/lib/recess/schedule";
import { COPY } from "@/lib/copy";

const ACTION_CLASS =
  "flex h-full flex-1 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-[#0D1238] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white";
const ACTION_STYLE = { fontFamily: "var(--font-inter)", fontSize: 18 } as const;

/** Wallet state only exists in the browser, so this half waits for mount. */
function PillAction() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => setMounted(true), []);

  if (!mounted || isConnected) {
    return (
      <Link href="/app" className={ACTION_CLASS} style={ACTION_STYLE}>
        {COPY.hero.launch}
      </Link>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <button type="button" onClick={openConnectModal} className={ACTION_CLASS} style={ACTION_STYLE}>
          {COPY.hero.connect}
        </button>
      )}
    </ConnectButton.Custom>
  );
}

/**
 * Corrective brief section 2. The 460x59 pill keeps the reference geometry.
 * White half: live countdown from the schedule, never from demo data.
 * Dark half: connect the wallet, or enter the app once connected.
 */
export function LaunchPill({ variant, id }: { variant: "hero" | "cta"; id?: string }) {
  const [clock, setClock] = useState<{ locked: boolean; left: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const epoch = epochAt(now);
      setClock({ locked: epoch.status !== "Open", left: formatCountdown(epoch.lockTime - now) });
    };
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id={id}
      data-testid={`launch-pill-${variant}`}
      className="flex h-[59px] w-[460px] max-w-full items-center rounded-full bg-ink"
    >
      <Link
        href="/app"
        className="flex h-full w-[288px] shrink-0 items-center gap-2 rounded-full border-2 border-ink bg-white px-[26px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue"
        style={{ fontFamily: "var(--font-inter)", fontSize: 18 }}
      >
        {clock === null ? (
          <span className="text-body">{COPY.hero.locksIn}</span>
        ) : clock.locked ? (
          <span className="text-ink">{COPY.hero.settling}</span>
        ) : (
          <>
            <span className="text-body">{COPY.hero.locksIn}</span>
            <span className="tabular text-ink">{clock.left}</span>
          </>
        )}
      </Link>
      <PillAction />
    </div>
  );
}
