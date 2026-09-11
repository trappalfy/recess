import type { Market, MarketStatus, Position, Side } from "@/lib/recess/types";
import { estimateMultiplier } from "@/lib/recess/math";
import { formatPercent } from "@/lib/recess/format";
import { RECESS_CONFIG } from "@/lib/recess/config";

/**
 * Update §3.3: before lock every multiplier is marked as an estimate. After
 * settlement only the winning side has one, and a void market has none.
 */
export function multiplierText(market: Market, side: Side): string {
  if (market.status === "Void") return "—";
  if (market.status === "Settled" && market.winner !== side) return "—";
  const x = estimateMultiplier(market.poolAbove, market.poolBelow, side, RECESS_CONFIG.feeBps);
  if (x === null) return "—";
  return market.status === "Open" ? `est. ${x.toFixed(2)}x` : `${x.toFixed(2)}x`;
}

export function ctaLabel(status: MarketStatus): string {
  if (status === "Open") return "Take a side";
  return status === "Locked" ? "View market" : "View result";
}

export function sidesOf(position: Position): string {
  if (position.above > 0n && position.below > 0n) return "Both sides";
  return position.above > 0n ? "Above" : "Below";
}

/** Price move from the Friday close; the arrow takes the colour of the side it favours. */
export function Move({ from, to }: { from: number; to: number }) {
  const v = (to - from) / from;
  return (
    <span className="tabular inline-flex items-center gap-1 text-ink">
      {v !== 0 && (
        <span aria-hidden="true" className={`text-[10px] ${v > 0 ? "text-above" : "text-below"}`}>
          {v > 0 ? "▲" : "▼"}
        </span>
      )}
      {formatPercent(v)}
    </span>
  );
}

export function SideDot({ side }: { side: Side }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${side === "Above" ? "bg-above" : "bg-below"}`}
    />
  );
}

/** Nothing while open; afterwards the stage, or the winning side once settled. Markets and positions both carry these two fields. */
export function StatusChip({ market }: { market: Pick<Market, "status" | "winner"> }) {
  if (market.status === "Open") return null;
  const dot =
    market.status === "Settled" ? (market.winner === "Above" ? "bg-above" : "bg-below") : "bg-body";
  return (
    <span className="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 text-[12px] text-body">
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {market.status === "Settled" ? `${market.winner} won` : market.status}
    </span>
  );
}

const ET = { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "2-digit" } as const;
const LOCAL = { weekday: "short", hour: "numeric", minute: "2-digit" } as const;

/** Update §3.2: a moment in Eastern time, with the visitor's own time in the tooltip. */
export function EtTime({ at, prefix }: { at: number; prefix?: string }) {
  const d = new Date(at);
  return (
    <span title={`${d.toLocaleString(undefined, LOCAL)} your time`}>
      {prefix ? `${prefix} ` : ""}
      {d.toLocaleString("en-US", ET)} ET
    </span>
  );
}

/** One label and value line inside a <dl>. */
export function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-body">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
