import { describe, it, expect } from "vitest";
import { MockClient } from "../../lib/recess/mock";
import { RECESS_CONFIG } from "../../lib/recess/config";
import type { PriceSource, ReferencePrices } from "../../lib/recess/prices";

/** Saturday Sep 12 2026, noon in New York: inside the Sep 11 weekend, betting open. */
const SATURDAY = Date.UTC(2026, 8, 12, 16, 0);
/** Sunday Sep 13 2026, 8:30 PM in New York: past the 7 PM lock. */
const SUNDAY_NIGHT = Date.UTC(2026, 8, 14, 0, 30);
/** Wednesday Sep 16 2026, noon in New York: between weekends. */
const WEDNESDAY = Date.UTC(2026, 8, 16, 16, 0);
/** Monday Sep 14 2026, 9:31 AM in New York: the open. */
const MONDAY_OPEN = Date.UTC(2026, 8, 14, 13, 31);

const prices = (p: Partial<ReferencePrices>): PriceSource => ({
  load: async () =>
    Object.fromEntries(
      RECESS_CONFIG.tickers.map((t) => [
        t,
        { fridayClose: 200, last: 200, lastAt: SATURDAY, settle: null, settleAt: null, ...p },
      ]),
    ),
});

async function first(c: MockClient) {
  const epoch = await c.getEpoch();
  const [market] = await c.listMarkets(epoch.id);
  return { epoch, market };
}

describe("MockClient with reference prices", () => {
  it("shows the feed's Friday close and last price", async () => {
    const c = new MockClient({
      instant: true,
      now: () => SATURDAY,
      prices: prices({ last: 204, lastAt: SATURDAY - 60_000 }),
    });
    const { market } = await first(c);
    expect(market.fridayClose).toBe(200);
    expect(market.poolPrice).toBe(204);
    expect(market.priceSource).toBe("chainlink");
    expect(market.priceAt).toBe(SATURDAY - 60_000);
    expect(market.closeProvisional).toBe(false);
  });

  it("stays locked after the lock until the first fresh print", async () => {
    const c = new MockClient({ instant: true, now: () => SUNDAY_NIGHT, prices: prices({}) });
    const { epoch, market } = await first(c);
    expect(epoch.status).toBe("Locked");
    expect(market.status).toBe("Locked");
  });

  it("settles on its own once the feed prints after the lock", async () => {
    const c = new MockClient({
      instant: true,
      now: () => WEDNESDAY,
      prices: prices({ last: 210, lastAt: WEDNESDAY, settle: 197, settleAt: MONDAY_OPEN }),
    });
    const { epoch, market } = await first(c);
    expect(epoch.status).toBe("Settled");
    expect(market.status).toBe("Settled");
    expect(market.settlePrice).toBe(197);
    expect(market.settleAt).toBe(MONDAY_OPEN);
    expect(market.winner).toBe("Below");
    expect(market.settleSimulated).toBe(false);
  });

  it("marks a settlement forced before any print as simulated", async () => {
    const c = new MockClient({ instant: true, now: () => SATURDAY, prices: prices({}) });
    c.advanceTo("Settled");
    const { market } = await first(c);
    expect(market.settleSimulated).toBe(true);
    expect(market.settleAt).toBeNull();
    expect(market.settlePrice).not.toBeNull();
  });

  it("marks the close provisional while Friday's close is still ahead", async () => {
    const c = new MockClient({
      instant: true,
      now: () => WEDNESDAY,
      prices: prices({ fridayClose: null, last: 190, lastAt: WEDNESDAY }),
    });
    c.advanceTo("Open");
    const { epoch, market } = await first(c);
    expect(epoch.id).toBe("2026-09-18");
    expect(market.fridayClose).toBe(190);
    expect(market.closeProvisional).toBe(true);
  });

  it("falls back to demo prices, and says so, when the feeds cannot be read", async () => {
    const c = new MockClient({
      instant: true,
      now: () => SATURDAY,
      prices: { load: async () => { throw new Error("rpc down"); } },
    });
    const { market } = await first(c);
    expect(market.priceSource).toBe("demo");
    expect(market.priceAt).toBeNull();
  });

  it("returns to the live weekend when told to follow it", async () => {
    const c = new MockClient({ instant: true, now: () => SATURDAY });
    c.advanceTo("Locked");
    expect(c.forcedStage).toBe("Locked");
    c.followLive();
    expect(c.forcedStage).toBeNull();
    expect((await c.getEpoch()).status).toBe("Open");
  });
});
