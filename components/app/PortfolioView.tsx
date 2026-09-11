"use client";

import Link from "next/link";
import { useMemo, useState, type KeyboardEvent } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { Position } from "@/lib/recess/types";
import { formatUsdg } from "@/lib/recess/format";
import { getClient } from "@/lib/recess/client";
import { useRecess } from "@/lib/recess/use-recess";
import { StatusChip } from "./market-bits";
import { useTx } from "./useTx";
import { CARD, H1_STYLE, PILL_DARK } from "./styles";

const TABS = [
  { id: "open", label: "Open" },
  { id: "claimable", label: "Claimable" },
  { id: "history", label: "History" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const EMPTY: Record<Tab, string> = {
  open: "No open positions.",
  claimable: "Nothing to claim right now.",
  history: "No settled positions yet.",
};

const PILL_LIGHT =
  "inline-flex h-10 items-center justify-center rounded-full border border-line px-5 text-[15px] text-ink transition-colors duration-200 hover:border-ink";

/**
 * Update §4: Open holds stakes awaiting settlement, Claimable holds winnings and
 * refunds each with its button, History holds everything claimed or lost.
 */
function sort(positions: Position[]): Record<Tab, Position[]> {
  const out: Record<Tab, Position[]> = { open: [], claimable: [], history: [] };
  for (const p of positions) {
    if (p.payout === null) out.open.push(p);
    else if (!p.claimed && p.payout > 0n) out.claimable.push(p);
    else out.history.push(p);
  }
  return out;
}

function stakes(p: Position): string {
  return [p.above > 0n && `Above ${formatUsdg(p.above)}`, p.below > 0n && `Below ${formatUsdg(p.below)}`]
    .filter(Boolean)
    .join(" · ")
    .concat(" USDG");
}

function ClaimButton({ position }: { position: Position }) {
  const tx = useTx();
  const voided = position.status === "Void";
  return (
    <button
      type="button"
      data-testid="claim"
      disabled={tx.pending}
      onClick={() =>
        tx.run((opts) => getClient().claim(position.marketId, opts), voided ? "Refund received" : "Payout claimed")
      }
      className={`${PILL_DARK} min-w-[104px] disabled:opacity-40`}
    >
      {tx.pending ? "Confirming…" : voided ? "Refund" : "Claim"}
    </button>
  );
}

function PositionRow({ position, tab }: { position: Position; tab: Tab }) {
  const voided = position.status === "Void";
  let end: React.ReactNode;
  if (tab === "open") {
    end = (
      <Link href={`/app/${position.ticker}`} className={PILL_LIGHT}>
        View market
      </Link>
    );
  } else if (tab === "claimable") {
    end = (
      <div className="flex items-center gap-4 sm:justify-end">
        <span className="tabular text-[15px] text-ink">
          {formatUsdg(position.payout!)} USDG{" "}
          <span className="text-body">{voided ? "refund" : "payout"}</span>
        </span>
        <ClaimButton position={position} />
      </div>
    );
  } else {
    end = (
      <span className="tabular text-[15px] text-body">
        {position.claimed ? (
          <>
            {voided ? "Refunded" : "Claimed"} <span className="text-ink">{formatUsdg(position.payout ?? 0n)} USDG</span>
          </>
        ) : (
          "Nothing to claim"
        )}
      </span>
    );
  }

  return (
    <li
      data-testid="position-row"
      className="grid gap-3 py-5 sm:grid-cols-[minmax(140px,1fr)_minmax(0,2fr)_auto] sm:items-center sm:gap-6"
    >
      <div className="flex items-center gap-2">
        <Link href={`/app/${position.ticker}`} className="text-[16px] text-ink hover:underline" style={{ fontWeight: 500 }}>
          {position.ticker}
        </Link>
        <StatusChip market={position} />
      </div>
      <p className="tabular text-[15px] text-body">{stakes(position)}</p>
      <div>{end}</div>
    </li>
  );
}

export function PortfolioView() {
  const { address, status } = useAccount();
  const [tab, setTab] = useState<Tab>("open");
  const { data, error } = useRecess(
    (client) => (address ? client.getPositions(address) : Promise.resolve([] as Position[])),
    [address],
  );
  const groups = useMemo(() => sort(data ?? []), [data]);

  const staked = groups.open.reduce((sum, p) => sum + p.above + p.below, 0n);
  const claimable = groups.claimable.reduce((sum, p) => sum + (p.payout ?? 0n), 0n);

  const onKey = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === tab);
    const next = TABS[(i + step + TABS.length) % TABS.length].id;
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  const header = (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <h1 className="text-ink" style={H1_STYLE}>
          Portfolio
        </h1>
        <p className="mt-3 max-w-[560px] text-[16px] leading-[1.5] text-body">
          Your stakes this weekend, what you can claim, and what has settled.
        </p>
      </div>
      {address && data && (
        <dl className="tabular flex gap-8">
          <div>
            <dt className="text-[13px] text-body">In open markets</dt>
            <dd className="mt-1 text-[20px] text-ink">{formatUsdg(staked)} USDG</dd>
          </div>
          <div>
            <dt className="text-[13px] text-body">Claimable</dt>
            <dd className="mt-1 text-[20px] text-ink">{formatUsdg(claimable)} USDG</dd>
          </div>
        </dl>
      )}
    </div>
  );

  if (status === "connecting" || status === "reconnecting") {
    return (
      <>
        {header}
        <div aria-busy="true" aria-label="Loading positions" className={`${CARD} h-[240px]`} />
      </>
    );
  }

  if (!address) {
    return (
      <>
        {header}
        <div className={`${CARD} flex flex-col items-start gap-5 p-8`}>
          <p className="text-[16px] text-body">Connect a wallet to see your positions.</p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button type="button" onClick={openConnectModal} className={PILL_DARK}>
                Connect wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      </>
    );
  }

  const list = groups[tab];

  return (
    <>
      {header}
      <div role="tablist" aria-label="Positions" onKeyDown={onKey} className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[15px] transition-colors duration-200 ${
                selected ? "border-ink bg-ink text-white" : "border-line text-body hover:text-ink"
              }`}
            >
              {t.label}
              <span className={`tabular text-[13px] ${selected ? "text-white/70" : "text-body"}`}>
                {groups[t.id].length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        data-testid="positions"
        className={`${CARD} mt-5 px-6 sm:px-8`}
      >
        {error ? (
          <p className="py-8 text-body">Positions could not load. Refresh to try again.</p>
        ) : !data ? (
          <div aria-busy="true" className="h-[200px]" />
        ) : list.length === 0 ? (
          <p className="py-8 text-[16px] text-body">
            {EMPTY[tab]}{" "}
            <Link href="/app" className="text-ink underline underline-offset-4">
              Pick a side on the board.
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((p) => (
              <PositionRow key={p.marketId} position={p} tab={tab} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
