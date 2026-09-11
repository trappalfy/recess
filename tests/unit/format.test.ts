import { describe, it, expect } from "vitest";
import { formatUsdg, formatPrice, formatPercent, parseUsdg } from "../../lib/recess/format";

describe("formatters", () => {
  it("renders USDG with two decimals and thousands separators", () => {
    expect(formatUsdg(1_234_560_000n)).toBe("1,234.56");
    expect(formatUsdg(0n)).toBe("0.00");
  });
  it("renders a price with two decimals", () => {
    expect(formatPrice(184.2)).toBe("184.20");
  });
  it("signs a percentage move", () => {
    expect(formatPercent(0.0123)).toBe("+1.23%");
    expect(formatPercent(-0.0123)).toBe("-1.23%");
    expect(formatPercent(0)).toBe("0.00%");
  });
});

describe("parseUsdg", () => {
  it("reads a typed amount into base units without float drift", () => {
    expect(parseUsdg("10")).toBe(10_000_000n);
    expect(parseUsdg("0.1")).toBe(100_000n);
    expect(parseUsdg("1234.567891")).toBe(1_234_567_891n);
  });
  it("drops digits beyond the token's precision", () => {
    expect(parseUsdg("1.0000019")).toBe(1_000_001n);
  });
  it("treats an empty or malformed field as zero", () => {
    expect(parseUsdg("")).toBe(0n);
    expect(parseUsdg(".")).toBe(0n);
    expect(parseUsdg("1.2.3")).toBe(0n);
  });
});
