import { describe, it, expect } from "vitest";
import { ChainClient, marketFrom } from "../../lib/recess/chain";
import { epochAt } from "../../lib/recess/schedule";
import { RECESS_CONFIG } from "../../lib/recess/config";
import type { PriceSource, ReferencePrices } from "../../lib/recess/prices";

/** Saturday Sep 12 2026, noon in New York: inside the Sep 11 weekend, betting open. */
const SATURDAY = Date.UTC(2026, 8, 12, 16, 0);
/** Sunday Sep 13 2026, 8:30 PM in New York: past the 7 PM lock. */
const SUNDAY_NIGHT = Date.UTC(2026, 8, 14, 0, 30);
/** Monday Sep 14 2026, 9:31 AM in New York: the open. */
const MONDAY_OPEN = Date.UTC(2026, 8, 14, 13, 31);
/** Wednesday Sep 16 2026, noon in New York: between weekends. */
const WEDNESDAY = Date.UTC(2026, 8, 16, 16, 0);

const ME = "0x1111111111111111111111111111111111111111" as const;

const ref = (p: Partial<ReferencePrices> = {}): ReferencePrices => ({
  fridayClose: 200, last: 204, lastAt: SATURDAY - 60_000, settle: null, settleAt: null, ...p,
});
const source = (p: Partial<ReferencePrices> = {}): PriceSource => ({
  load: async () => Object.fromEntries(RECESS_CONFIG.tickers.map((t) => [t, ref(p)])),
});

describe("marketFrom", () => {
  const epoch = epochAt(SATURDAY);

  it("is open before the lock, on the feed's close and last price, with empty pools", () => {
    expect(marketFrom("NVDA", epoch, ref(), SATURDAY)).toMatchObject({
      id: "2026-09-11:NVDA", status: "Open", fridayClose: 200, poolPrice: 204,
      poolAbove: 0n, poolBelow: 0n, winner: null, closeProvisional: false,
    });
  });

  it("locks at the lock and waits for the first fresh print", () => {
    expect(marketFrom("NVDA", epoch, ref(), SUNDAY_NIGHT).status).toBe("Locked");
  });

  it("settles on the first print and names the side it landed on", () => {
    expect(marketFrom("NVDA", epoch, ref({ settle: 197, settleAt: MONDAY_OPEN }), WEDNESDAY)).toMatchObject({
      status: "Settled", winner: "Below", settlePrice: 197, settleAt: MONDAY_OPEN,
    });
  });

  it("voids when the first print lands on the close", () => {
    expect(marketFrom("NVDA", epoch, ref({ settle: 200, settleAt: MONDAY_OPEN }), WEDNESDAY).status).toBe("Void");
  });

  it("falls back to the latest price when the feed had no value at the close", () => {
    const m = marketFrom("NVDA", epoch, ref({ fridayClose: null }), SATURDAY);
    expect(m.fridayClose).toBe(204);
    expect(m.closeProvisional).toBe(true);
  });
});

describe("ChainClient before the contracts are live", () => {
  it("lists one market per configured ticker for the live weekend only", async () => {
    const c = new ChainClient({ prices: source(), now: () => SATURDAY });
    const epoch = await c.getEpoch();
    expect(epoch).toMatchObject({ id: "2026-09-11", status: "Open" });
    expect((await c.listMarkets(epoch.id)).map((m) => m.ticker)).toEqual([...RECESS_CONFIG.tickers]);
    expect(await c.listMarkets("2026-09-04")).toEqual([]);
    expect((await c.getMarket(epoch.id, "nvda"))?.ticker).toBe("NVDA");
  });

  it("reports the weekend settled once the feeds printed after the lock", async () => {
    const c = new ChainClient({ prices: source({ settle: 207, settleAt: MONDAY_OPEN }), now: () => WEDNESDAY });
    expect((await c.getEpoch()).status).toBe("Settled");
  });

  it("still names the weekend from the schedule when the feeds cannot be read", async () => {
    const c = new ChainClient({
      prices: { load: async () => { throw new Error("rpc down"); } },
      now: () => SUNDAY_NIGHT,
    });
    expect(await c.getEpoch()).toMatchObject({ id: "2026-09-11", status: "Locked" });
    await expect(c.listMarkets("2026-09-11")).rejects.toThrow(/rpc down/);
  });

  it("has no positions, no activity and nothing to approve yet", async () => {
    const c = new ChainClient({ prices: source(), now: () => SATURDAY });
    expect(await c.getPositions(ME)).toEqual([]);
    expect(await c.listActivity("2026-09-11:NVDA")).toEqual([]);
    expect(await c.getAllowance(ME)).toBeNull();
  });

  it("sends no transaction", async () => {
    const c = new ChainClient({ prices: source(), now: () => SATURDAY });
    await expect(c.stake("2026-09-11:NVDA", "Above", 1n)).rejects.toThrow(/not live/i);
    await expect(c.approveUsdg(1n)).rejects.toThrow(/not live/i);
    await expect(c.claim("2026-09-11:NVDA")).rejects.toThrow(/not live/i);
  });
});
