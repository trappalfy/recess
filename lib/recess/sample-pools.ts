import type { Side } from "./types";

const MIN_CENTS = 200_00;
const MAX_CENTS = 800_00;
/** One cent in USDG base units (6 decimals). */
const CENT = 10_000n;

/** FNV-1a, 32-bit: a fixed number for a fixed string. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Placeholder pools, shown by the owner's decision until the contracts are live:
 * 200 to 800 USDG a side. Fixed per market and side, so a reload shows the same
 * figures, and every ticker and weekend gets its own.
 */
export function samplePool(marketId: string, side: Side): bigint {
  const cents = MIN_CENTS + (hash(`${marketId}:${side}`) % (MAX_CENTS - MIN_CENTS + 1));
  return BigInt(cents) * CENT;
}
