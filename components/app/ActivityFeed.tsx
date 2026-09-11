import type { Activity } from "@/lib/recess/types";
import { formatUsdg } from "@/lib/recess/format";
import { SideDot } from "./market-bits";
import { CARD, H2_STYLE } from "./styles";

const SHOWN = 8;

function timeAgo(at: number, now: number): string {
  const minutes = Math.floor((now - at) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/**
 * Update §4: the latest stakes on this market. An event indexer serves them
 * through listActivity once the contracts are live.
 */
export function ActivityFeed({
  items,
  me,
  className = "",
}: {
  items: Activity[];
  me?: `0x${string}`;
  className?: string;
}) {
  const now = Date.now();
  const mine = (a: Activity) => me !== undefined && a.user.toLowerCase() === me.toLowerCase();

  return (
    <section aria-labelledby="activity-title" className={`${CARD} p-6 sm:p-8 ${className}`}>
      <h2 id="activity-title" className="text-ink" style={H2_STYLE}>
        Recent stakes
      </h2>
      {items.length === 0 ? (
        <p className="mt-4 text-[15px] text-body">No stakes yet. Be the first to take a side.</p>
      ) : (
        <ul data-testid="activity" className="mt-3 divide-y divide-line">
          {items.slice(0, SHOWN).map((a) => (
            <li key={a.id} className="tabular flex items-center gap-4 py-3 text-[15px]">
              <span className="flex w-[76px] shrink-0 items-center gap-2 text-ink">
                <SideDot side={a.side} />
                {a.side}
              </span>
              <span className="text-ink">{formatUsdg(a.amount)} USDG</span>
              <span className={`ml-auto ${mine(a) ? "text-ink" : "hidden text-body sm:inline"}`}>
                {mine(a) ? "You" : short(a.user)}
              </span>
              <span className={`w-[68px] shrink-0 text-right text-body ${mine(a) ? "" : "ml-auto sm:ml-0"}`}>
                {timeAgo(a.at, now)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
