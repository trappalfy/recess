import { describe, it, expect } from "vitest";
import { sideShare, estimateMultiplier, estimatePayout } from "../../lib/recess/math";

const U = (n: number) => BigInt(n) * 1_000_000n; // 6-decimal USDG

describe("sideShare", () => {
  it("splits an even pool down the middle", () => {
    expect(sideShare(U(50), U(50), "Above")).toBeCloseTo(0.5, 6);
  });
  it("reports the whole pool when one side is empty", () => {
    expect(sideShare(U(80), 0n, "Above")).toBeCloseTo(1, 6);
  });
  it("returns a half when the market is empty, so the bar renders", () => {
    expect(sideShare(0n, 0n, "Above")).toBeCloseTo(0.5, 6);
  });
});

describe("estimateMultiplier", () => {
  it("applies the fee to the whole pool", () => {
    // total 100, fee 2%, Above holds 25 => 98 / 25 = 3.92
    expect(estimateMultiplier(U(25), U(75), "Above", 200)).toBeCloseTo(3.92, 6);
  });
  it("is just under one when a side holds the whole pool", () => {
    expect(estimateMultiplier(U(100), 0n, "Above", 200)).toBeCloseTo(0.98, 6);
  });
  it("has no value when the side is empty", () => {
    expect(estimateMultiplier(0n, U(100), "Above", 200)).toBeNull();
  });
});

describe("estimatePayout", () => {
  it("counts the new stake in the pool it joins", () => {
    // Above 25, Below 75, stake 25 on Above => total 125, net 122.5,
    // winning side 50 => 25 * 122.5 / 50 = 61.25
    expect(estimatePayout(U(25), U(25), U(75), "Above", 200)).toBe(61_250_000n);
  });
  it("returns the stake back, less fee, when it is the only one", () => {
    expect(estimatePayout(U(10), 0n, 0n, "Above", 200)).toBe(9_800_000n);
  });
  it("has no value for a zero stake", () => {
    expect(estimatePayout(0n, U(25), U(75), "Above", 200)).toBeNull();
  });
});
