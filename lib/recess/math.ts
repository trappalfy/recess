import type { Side } from "./types";

const BPS = 10_000n;

const pick = (above: bigint, below: bigint, side: Side) => (side === "Above" ? above : below);

/** Fraction of the pool held by one side. Half on an empty market, so the bar still renders. */
export function sideShare(poolAbove: bigint, poolBelow: bigint, side: Side): number {
  const total = poolAbove + poolBelow;
  if (total === 0n) return 0.5;
  return Number(pick(poolAbove, poolBelow, side)) / Number(total);
}

/** Update §3.3: (poolAbove + poolBelow) × (1 − feeBps / 10000) / poolSide. */
export function estimateMultiplier(
  poolAbove: bigint,
  poolBelow: bigint,
  side: Side,
  feeBps: number,
): number | null {
  const sidePool = pick(poolAbove, poolBelow, side);
  if (sidePool === 0n) return null;
  const net = ((poolAbove + poolBelow) * (BPS - BigInt(feeBps))) / BPS;
  return Number(net) / Number(sidePool);
}

/**
 * Update §3.3: stake × (totalPool × (1 − feeBps / 10000)) / winningSidePool,
 * evaluated as though this stake has already joined its side.
 */
export function estimatePayout(
  stake: bigint,
  poolAbove: bigint,
  poolBelow: bigint,
  side: Side,
  feeBps: number,
): bigint | null {
  if (stake <= 0n) return null;
  const above = side === "Above" ? poolAbove + stake : poolAbove;
  const below = side === "Below" ? poolBelow + stake : poolBelow;
  const winningSide = pick(above, below, side);
  if (winningSide === 0n) return null;
  const net = ((above + below) * (BPS - BigInt(feeBps))) / BPS;
  return (stake * net) / winningSide;
}
