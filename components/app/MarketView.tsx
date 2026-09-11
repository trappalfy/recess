"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAccount } from "wagmi";
import type { Activity, Market, Position } from "@/lib/recess/types";
import { formatPrice, formatUsdg } from "@/lib/recess/format";
import { sideShare } from "@/lib/recess/math";
import { useRecess } from "@/lib/recess/use-recess";
import { ActivityFeed } from "./ActivityFeed";
import { EpochTimeline } from "./EpochTimeline";
import { ResultPanel } from "./ResultPanel";
import { RulesBlock } from "./RulesBlock";
import { SideBar } from "./SideBar";
import { StakePanel } from "./StakePanel";
import { EtTime, Move, SideDot, StatusChip, multiplierText } from "./market-bits";
import { CARD, H1_STYLE } from "./styles";

function BackLink() {
  return (
    <Link href="/app" className="inline-flex items-center gap-1.5 text-[14px] text-body hover:text-ink">
      <ArrowLeft size={16} aria-hidden="true" />
      Board
    </Link>
  );
}

function Figure({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-body">{label}</dt>
      <dd className="mt-1 text-[22px] leading-tight text-ink">{value}</dd>
      {note && <dd className="mt-1 text-[13px] text-body">{note}</dd>}
    </div>
  );
}

/** Update §4, left column: the key figures and the split of the pool. */
function KeyFigures({ market, className = "" }: { market: Market; className?: string }) {
  const pct = Math.round(sideShare(market.poolAbove, market.poolBelow, "Above") * 100);
  const settled = market.settlePrice !== null;
  return (
    <section aria-label="Key figures" className={`${CARD} p-6 sm:p-8 ${className}`}>
      <dl className="tabular grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
        <Figure
          label="Friday close"
          value={`$${formatPrice(market.fridayClose)}`}
          note={
            market.closeProvisional
              ? "Latest price until Friday 4:00 PM ET"
              : market.priceSource === "chainlink"
                ? "Chainlink reference"
                : "Demo price"
          }
        />
        <Figure
          label="Last price"
          value={`$${formatPrice(market.poolPrice)}`}
          note={
            <>
              <Move from={market.fridayClose} to={market.poolPrice} />
              {market.priceAt !== null && (
                <>
                  {" · "}
                  <EtTime at={market.priceAt} />
                </>
              )}
            </>
          }
        />
        <Figure label="Total pool" value={formatUsdg(market.poolAbove + market.poolBelow)} note="USDG" />
        {settled ? (
          <Figure
            label="First print"
            value={`$${formatPrice(market.settlePrice!)}`}
            note={
              <>
                <Move from={market.fridayClose} to={market.settlePrice!} />
                {market.settleSimulated && " · simulated"}
                {market.settleAt !== null && (
                  <>
                    {" · "}
                    <EtTime at={market.settleAt} />
                  </>
                )}
              </>
            }
          />
        ) : (
          <Figure
            label={market.status === "Open" ? "Locks" : "Locked"}
            value={<EtTime at={market.lockTime} />}
            note={market.status === "Open" ? "Betting closes" : "Settles at the open"}
          />
        )}
      </dl>

      <div className="mt-8">
        <div className="tabular flex justify-between text-[14px] text-ink">
          <span className="flex items-center gap-2">
            <SideDot side="Above" />
            Above {pct}%
          </span>
          <span className="flex items-center gap-2">
            Below {100 - pct}%
            <SideDot side="Below" />
          </span>
        </div>
        <SideBar className="mt-3" height={12} above={market.poolAbove} below={market.poolBelow} />
        <div className="tabular mt-3 flex justify-between gap-4 text-[14px]">
          <span>
            <span className="text-ink">{formatUsdg(market.poolAbove)} USDG</span>
            <span className="block text-[13px] text-body">{multiplierText(market, "Above")}</span>
          </span>
          <span className="text-right">
            <span className="text-ink">{formatUsdg(market.poolBelow)} USDG</span>
            <span className="block text-[13px] text-body">{multiplierText(market, "Below")}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

type Loaded = { market: Market | null; activity: Activity[]; position: Position | null };

/**
 * Update §4, one ticker: figures, split, timeline, rules and recent stakes on
 * the left; the stake panel on the right, or the result once settled. Below
 * 1024 the panel follows the figures, so the action stays near the top.
 */
export function MarketView({ ticker }: { ticker: string }) {
  const { address } = useAccount();
  const { data, error } = useRecess(
    async (client): Promise<Loaded> => {
      const epoch = await client.getEpoch();
      const market = await client.getMarket(epoch.id, ticker);
      if (!market) return { market: null, activity: [], position: null };
      const [activity, positions] = await Promise.all([
        client.listActivity(market.id),
        address ? client.getPositions(address) : Promise.resolve([] as Position[]),
      ]);
      return { market, activity, position: positions.find((p) => p.marketId === market.id) ?? null };
    },
    [ticker, address],
  );

  if (error || !data || !data.market) {
    return (
      <>
        <BackLink />
        <div className="mt-6">
          {error ? (
            <p className={`${CARD} p-8 text-body`}>This market could not load. Refresh to try again.</p>
          ) : !data ? (
            <div aria-busy="true" aria-label="Loading the market" className={`${CARD} h-[480px]`} />
          ) : (
            <p className={`${CARD} p-8 text-body`}>
              There is no {ticker} market this weekend.{" "}
              <Link href="/app" className="text-ink underline underline-offset-4">
                Back to the board
              </Link>
            </p>
          )}
        </div>
      </>
    );
  }

  const { market, activity, position } = data;
  const finished = market.status === "Settled" || market.status === "Void";

  return (
    <>
      <BackLink />
      <header className="mb-8 mt-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-ink" style={H1_STYLE}>
            {market.ticker}
          </h1>
          <StatusChip market={market} />
        </div>
        <p className="mt-3 text-[16px] leading-[1.5] text-body">
          Will the first print after the weekend land above or below ${formatPrice(market.fridayClose)}?
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <KeyFigures market={market} className="lg:col-start-1" />
        <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-4 lg:row-start-1">
          {finished ? (
            <ResultPanel market={market} position={position} />
          ) : (
            <StakePanel market={market} position={position} />
          )}
        </div>
        <EpochTimeline market={market} className="lg:col-start-1" />
        <RulesBlock market={market} className="lg:col-start-1" />
        <ActivityFeed items={activity} me={address} className="lg:col-start-1" />
      </div>
    </>
  );
}
