import type { Market } from "@/lib/recess/types";
import { formatPrice } from "@/lib/recess/format";
import { RECESS_CONFIG } from "@/lib/recess/config";
import { CARD, H2_STYLE } from "./styles";

/**
 * Update §3.1 and §3.4 in the site's own words: the reference feed settles the
 * market, not the pool, and three cases void it. Fee and window come from config.
 */
export function RulesBlock({ market, className = "" }: { market: Market; className?: string }) {
  const lead = "text-ink";
  return (
    <section aria-labelledby="rules-title" className={`${CARD} p-6 sm:p-8 ${className}`}>
      <h2 id="rules-title" className="text-ink" style={H2_STYLE}>
        How this market settles
      </h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-[1.55] text-body">
        <li>
          <span className={lead} style={{ fontWeight: 500 }}>Reference. </span>
          The first fresh print of the {market.ticker} Chainlink reference feed after the weekend decides the
          market. The last price on this page reads the same feed as it moves; only that first print after the
          weekend counts.
        </li>
        <li>
          <span className={lead} style={{ fontWeight: 500 }}>Outcome. </span>
          Above wins if that print is above Friday&rsquo;s close of ${formatPrice(market.fridayClose)}, Below wins if it
          is below. The winning side shares the whole pool, less the {RECESS_CONFIG.feeBps / 100}% protocol fee,
          in proportion to each stake.
        </li>
        <li>
          <span className={lead} style={{ fontWeight: 500 }}>Void. </span>
          Every stake is refunded, with no fee, if the first print equals Friday&rsquo;s close, if one side is empty
          when betting closes, or if no fresh print arrives within {RECESS_CONFIG.voidAfterHours} hours of the lock.
        </li>
      </ul>
    </section>
  );
}
