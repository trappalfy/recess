import { RECESS_CONFIG } from "./config";

const DECIMALS = RECESS_CONFIG.usdgDecimals;
const SCALE = 10 ** DECIMALS;

export function formatUsdg(v: bigint): string {
  return (Number(v) / SCALE).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPrice(v: number): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPercent(v: number): string {
  const pct = (v * 100).toFixed(2);
  return v > 0 ? `+${pct}%` : `${pct}%`;
}

/** A typed amount into base units, read as a decimal string so 0.1 stays exact. */
export function parseUsdg(raw: string): bigint {
  const match = /^(\d*)(?:\.(\d*))?$/.exec(raw.trim());
  if (!match || (match[1] === "" && !match[2])) return 0n;
  const whole = match[1] || "0";
  const fraction = (match[2] ?? "").slice(0, DECIMALS).padEnd(DECIMALS, "0");
  return BigInt(whole) * BigInt(SCALE) + BigInt(fraction);
}

/** Base units back into a string the amount field can hold, without trailing zeros. */
export function usdgToInput(v: bigint): string {
  const whole = v / BigInt(SCALE);
  const fraction = (v % BigInt(SCALE)).toString().padStart(DECIMALS, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}
