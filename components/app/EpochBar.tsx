"use client";

import { useEffect, useState } from "react";
import { epochAt, formatCountdown } from "@/lib/recess/schedule";
import { useRecess } from "@/lib/recess/use-recess";
import { EtTime } from "./market-bits";

const DOT = { Open: "bg-above", Locked: "bg-body", Settled: "bg-blue" } as const;
const WEEK_PLUS = 7 * 86_400_000 + 3 * 3_600_000;

/** Update §4: the weekend, its status and the time to the next stage. */
export function EpochBar() {
  const { data: epoch } = useRecess((client) => client.getEpoch(), []);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  let detail: React.ReactNode = null;
  if (epoch && now !== null) {
    if (epoch.status === "Open") {
      detail = (
        <>
          <EtTime at={epoch.lockTime} prefix="Locks" />
          {" · "}
          <span className="text-ink">in {formatCountdown(epoch.lockTime - now)}</span>
        </>
      );
    } else if (epoch.status === "Locked") {
      detail = "Betting is closed. Settles at the open.";
    } else {
      detail = <EtTime at={epochAt(epoch.openTime + WEEK_PLUS).openTime} prefix="Next board opens" />;
    }
  }

  return (
    <div data-testid="epoch-bar" className="border-b border-line bg-white">
      <div className="container-recess flex min-h-[52px] flex-wrap items-center gap-x-5 gap-y-1 py-2">
        <span className="text-ink" style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 15 }}>
          {epoch?.label ?? " "}
        </span>
        {epoch && (
          <span
            data-testid="epoch-status"
            className="inline-flex h-7 items-center gap-2 rounded-full border border-line px-3 text-[13px] text-ink"
          >
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT[epoch.status]}`} />
            {epoch.status}
          </span>
        )}
        <span className="tabular text-[14px] text-body">{detail}</span>
      </div>
    </div>
  );
}
