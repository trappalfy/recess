"use client";

import { useAccount } from "wagmi";
import { formatUsdg } from "@/lib/recess/format";
import { useRecess } from "@/lib/recess/use-recess";
import type { Market, Position } from "@/lib/recess/types";
import { MarketTable } from "./MarketTable";
import { EtTime } from "./market-bits";
import { CARD, H1_STYLE } from "./styles";

/** Says where the prices on the board come from, and how fresh they are. */
function PriceNote({ markets }: { markets: Market[] }) {
  const latest = Math.max(0, ...markets.map((m) => m.priceAt));
  return (
    <p data-testid="price-note" className="mt-2 text-[13px] text-body">
      Prices from Chainlink reference feeds
      {latest > 0 && (
        <>
          , last update <EtTime at={latest} />
        </>
      )}
      .
    </p>
  );
}

/**
 * Update §4, the board: every market of the current weekend. Data loads in the
 * browser, because the adapter is client-side by design and there is no server layer.
 */
export function BoardView() {
  const { address } = useAccount();
  const { data, error } = useRecess(
    async (client) => {
      const epoch = await client.getEpoch();
      const [markets, positions] = await Promise.all([
        client.listMarkets(epoch.id),
        address ? client.getPositions(address) : Promise.resolve([] as Position[]),
      ]);
      return { markets, positions };
    },
    [address],
  );

  const total = data?.markets.reduce((sum, m) => sum + m.poolAbove + m.poolBelow, 0n) ?? 0n;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-ink" style={H1_STYLE}>This Weekend&rsquo;s Board</h1>
          <p className="mt-3 max-w-[560px] text-[16px] leading-[1.5] text-body">
            One question per ticker: will the first print after the weekend land above or below
            Friday&rsquo;s close?
          </p>
          {data && <PriceNote markets={data.markets} />}
        </div>
        {data && (
          <dl className="tabular flex gap-8">
            <div>
              <dt className="text-[13px] text-body">Markets</dt>
              <dd className="mt-1 text-[20px] text-ink">{data.markets.length}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-body">In all pools</dt>
              <dd className="mt-1 text-[20px] text-ink">{formatUsdg(total)} USDG</dd>
            </div>
          </dl>
        )}
      </div>

      {error ? (
        <p className={`${CARD} p-8 text-body`}>The board could not load. Refresh to try again.</p>
      ) : data ? (
        <MarketTable markets={data.markets} positions={data.positions} />
      ) : (
        <div aria-busy="true" aria-label="Loading the board" className={`${CARD} h-[420px]`} />
      )}
    </>
  );
}
