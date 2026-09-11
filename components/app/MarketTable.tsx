"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Market, Position } from "@/lib/recess/types";
import { formatUsdg, formatPrice } from "@/lib/recess/format";
import { SideBar } from "./SideBar";
import { Move, SideDot, StatusChip, ctaLabel, multiplierText, sidesOf } from "./market-bits";
import { CARD, PILL_DARK } from "./styles";

type Sort = "pool" | "ticker";

const TH = "px-4 py-4 font-normal";

/**
 * Update §4: ticker, Friday close, pool price and its move, both pools with the
 * split between them and their multipliers, the visitor's position and a link to
 * the market. Sortable by pool size and ticker, searchable by ticker. The eight
 * columns need 1280px; below that each market is a card.
 */
export function MarketTable({ markets, positions }: { markets: Market[]; positions: Position[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("pool");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = markets.filter((m) => m.ticker.toLowerCase().includes(q));
    return [...filtered].sort((a, b) => {
      if (sort === "ticker") return a.ticker.localeCompare(b.ticker);
      const diff = b.poolAbove + b.poolBelow - (a.poolAbove + a.poolBelow);
      return diff > 0n ? 1 : diff < 0n ? -1 : 0;
    });
  }, [markets, query, sort]);

  const mine = (id: string) => positions.find((p) => p.marketId === id);

  return (
    <section aria-label="Markets">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="relative w-full sm:w-[280px]">
          <span className="sr-only">Search by ticker</span>
          <Search size={16} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker"
            className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-4 text-[15px] text-ink outline-none placeholder:text-body focus-visible:border-blue"
          />
        </label>
        <div role="group" aria-label="Sort markets" className="flex gap-2">
          {(["pool", "ticker"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={sort === s}
              onClick={() => setSort(s)}
              className={`h-11 rounded-full border px-4 text-[15px] transition-colors duration-200 ${
                sort === s ? "border-ink text-ink" : "border-line text-body hover:text-ink"
              }`}
            >
              {s === "pool" ? "Largest pool" : "A to Z"}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className={`${CARD} p-8 text-body`}>No ticker matches “{query.trim()}”.</p>
      ) : (
        <>
          <div className={`${CARD} hidden overflow-hidden xl:block`}>
            <table className="w-full text-[15px]">
              <caption className="sr-only">Markets for the current weekend</caption>
              <thead>
                <tr className="border-b border-line text-left text-[13px] text-body">
                  <th scope="col" className={`${TH} pl-6`}>Ticker</th>
                  <th scope="col" className={TH}>Friday close</th>
                  <th scope="col" className={TH}>Pool price</th>
                  <th scope="col" className={`${TH} text-right`}>
                    <span className="inline-flex items-center gap-2"><SideDot side="Above" />Above</span>
                  </th>
                  <th scope="col" className={`${TH} text-center`}>Split</th>
                  <th scope="col" className={TH}>
                    <span className="inline-flex items-center gap-2"><SideDot side="Below" />Below</span>
                  </th>
                  <th scope="col" className={TH}>Your position</th>
                  <th scope="col" className={`${TH} pr-6`}><span className="sr-only">Market</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const position = mine(m.id);
                  return (
                    <tr key={m.id} data-testid="market-row" className="border-b border-line last:border-0">
                      <th scope="row" className="py-5 pl-6 pr-4 text-left font-normal">
                        <span className="flex items-center gap-2">
                          <span className="text-[16px] text-ink" style={{ fontWeight: 500 }}>{m.ticker}</span>
                          <StatusChip market={m} />
                        </span>
                      </th>
                      <td className="tabular px-4 py-5 text-ink">${formatPrice(m.fridayClose)}</td>
                      <td className="tabular px-4 py-5">
                        <span className="text-ink">${formatPrice(m.poolPrice)}</span>{" "}
                        <Move from={m.fridayClose} to={m.poolPrice} />
                      </td>
                      <td className="tabular px-4 py-5 text-right">
                        <span className="text-ink">{formatUsdg(m.poolAbove)}</span>
                        <span className="block text-[13px] text-body">{multiplierText(m, "Above")}</span>
                      </td>
                      <td className="w-[150px] px-4 py-5">
                        <SideBar above={m.poolAbove} below={m.poolBelow} />
                      </td>
                      <td className="tabular px-4 py-5">
                        <span className="text-ink">{formatUsdg(m.poolBelow)}</span>
                        <span className="block text-[13px] text-body">{multiplierText(m, "Below")}</span>
                      </td>
                      <td className="tabular px-4 py-5">
                        {position ? (
                          <>
                            <span className="text-ink">{formatUsdg(position.above + position.below)}</span>
                            <span className="block text-[13px] text-body">{sidesOf(position)}</span>
                          </>
                        ) : (
                          <span className="text-body">—</span>
                        )}
                      </td>
                      <td className="py-5 pl-4 pr-6 text-right">
                        <Link href={`/app/${m.ticker}`} className={PILL_DARK}>
                          {ctaLabel(m.status)}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
            {rows.map((m) => {
              const position = mine(m.id);
              return (
                <li key={m.id} data-testid="market-row" className={`${CARD} flex flex-col p-6`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="flex items-center gap-2">
                        <span className="text-[20px] text-ink" style={{ fontWeight: 500 }}>{m.ticker}</span>
                        <StatusChip market={m} />
                      </span>
                      <span className="tabular mt-1 block text-[14px] text-body">
                        Friday close ${formatPrice(m.fridayClose)}
                      </span>
                    </div>
                    <div className="tabular text-right text-[14px]">
                      <span className="block text-body">Pool price</span>
                      <span className="text-ink">${formatPrice(m.poolPrice)}</span>{" "}
                      <Move from={m.fridayClose} to={m.poolPrice} />
                    </div>
                  </div>

                  <SideBar className="mt-5" above={m.poolAbove} below={m.poolBelow} />
                  <div className="tabular mt-3 flex justify-between gap-4 text-[14px]">
                    <span>
                      <span className="text-ink">{formatUsdg(m.poolAbove)}</span>
                      <span className="flex items-center gap-1.5 text-[13px] text-body">
                        <SideDot side="Above" />Above · {multiplierText(m, "Above")}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="text-ink">{formatUsdg(m.poolBelow)}</span>
                      <span className="flex items-center justify-end gap-1.5 text-[13px] text-body">
                        <SideDot side="Below" />Below · {multiplierText(m, "Below")}
                      </span>
                    </span>
                  </div>

                  {position && (
                    <p className="tabular mt-4 text-[14px] text-body">
                      Your position <span className="text-ink">{formatUsdg(position.above + position.below)} USDG</span>
                      {" · "}
                      {sidesOf(position)}
                    </p>
                  )}

                  <div className="mt-auto pt-5">
                    <Link href={`/app/${m.ticker}`} className={`${PILL_DARK} h-11 w-full`}>
                      {ctaLabel(m.status)}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
