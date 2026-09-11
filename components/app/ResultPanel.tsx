"use client";

import { useAccount } from "wagmi";
import type { Market, Position } from "@/lib/recess/types";
import { formatPrice, formatUsdg } from "@/lib/recess/format";
import { getClient } from "@/lib/recess/client";
import { ConnectAction } from "./ConnectAction";
import { Move, Row, SideDot, multiplierText, sidesOf } from "./market-bits";
import { useTx } from "./useTx";
import { ACTION_BTN, CARD } from "./styles";

/**
 * Update §4: once the market settles the stake panel gives way to the result,
 * with `Claim` for a winning stake, or `Refund` when the market voided.
 */
export function ResultPanel({ market, position }: { market: Market; position: Position | null }) {
  const { isConnected } = useAccount();
  const tx = useTx();
  const voided = market.status === "Void";
  const winner = market.winner;

  const reason = !voided
    ? null
    : market.poolAbove === 0n || market.poolBelow === 0n
      ? "One side was empty when betting closed."
      : market.settlePrice === market.fridayClose
        ? "The first print landed exactly on Friday’s close."
        : "No fresh print arrived in time after the lock.";

  let body: React.ReactNode;
  if (!isConnected) {
    body = <ConnectAction />;
  } else if (!position) {
    body = <p className="text-[15px] text-body">You had no stake in this market.</p>;
  } else if (position.claimed) {
    body = (
      <p className="tabular text-[15px] text-ink">
        {voided ? "Refunded" : "Claimed"} {formatUsdg(position.payout ?? 0n)} USDG.
      </p>
    );
  } else if (position.payout && position.payout > 0n) {
    const payout = position.payout;
    body = (
      <>
        <dl className="tabular mb-5 text-[15px]">
          <Row label={voided ? "Your refund" : "Your payout"} value={`${formatUsdg(payout)} USDG`} />
        </dl>
        <button
          type="button"
          data-testid="stake-action"
          disabled={tx.pending}
          onClick={() =>
            tx.run((opts) => getClient().claim(market.id, opts), voided ? "Refund received" : "Payout claimed")
          }
          className={ACTION_BTN}
        >
          {tx.pending ? "Confirming…" : voided ? "Refund" : "Claim"}
        </button>
      </>
    );
  } else {
    body = (
      <p className="text-[15px] leading-[1.5] text-body">
        Your stake was on {sidesOf(position)}. {winner} won, so there is nothing to claim.
      </p>
    );
  }

  return (
    <section data-testid="stake-panel" aria-labelledby="result-title" className={`${CARD} p-6 sm:p-8`}>
      <p className="text-[14px] text-body">{voided ? "Market voided" : "Settled"}</p>
      <h2
        id="result-title"
        className="mt-1 flex items-center gap-3 text-ink"
        style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 28, lineHeight: 1.2 }}
      >
        {voided ? (
          "Every stake is refunded"
        ) : (
          <>
            {winner && <SideDot side={winner} />}
            {winner} won
          </>
        )}
      </h2>

      <dl className="tabular mt-5 space-y-2 border-t border-line pt-5 text-[15px]">
        <Row label="Friday close" value={`$${formatPrice(market.fridayClose)}`} />
        <Row
          label="First print"
          value={
            market.settlePrice !== null ? (
              <>
                ${formatPrice(market.settlePrice)} <Move from={market.fridayClose} to={market.settlePrice} />
              </>
            ) : (
              "—"
            )
          }
        />
        {!voided && winner && <Row label="Winning multiplier" value={multiplierText(market, winner)} />}
      </dl>
      {reason && <p className="mt-3 text-[13px] leading-[1.45] text-body">{reason}</p>}

      <div className="mt-6 border-t border-line pt-6">{body}</div>
    </section>
  );
}
