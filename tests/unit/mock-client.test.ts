import { describe, it, expect, beforeEach, vi } from "vitest";
import { MockClient } from "../../lib/recess/mock";
import { RECESS_CONFIG } from "../../lib/recess/config";

const ME = "0x1111111111111111111111111111111111111111" as const;
const U = (n: number) => BigInt(n) * 1_000_000n;

/** Saturday Sep 12 2026, noon in New York: inside the Sep 11 weekend, betting open. */
const SATURDAY = Date.UTC(2026, 8, 12, 16, 0);
/** Sunday Sep 13 2026, 8:30 PM in New York: past the 7 PM lock. */
const SUNDAY_NIGHT = Date.UTC(2026, 8, 14, 0, 30);
/** Wednesday Sep 16 2026, noon in New York: between weekends. */
const WEDNESDAY = Date.UTC(2026, 8, 16, 16, 0);

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: (i) => [...map.keys()][i] ?? null,
    get length() { return map.size; },
  };
}

const make = (opts: ConstructorParameters<typeof MockClient>[0] = {}) =>
  new MockClient({ instant: true, now: () => SATURDAY, ...opts });

let client: MockClient;
beforeEach(() => { client = make(); });

async function firstMarket(c = client) {
  const epoch = await c.getEpoch();
  const [market] = await c.listMarkets(epoch.id);
  return { epoch, market };
}

describe("MockClient", () => {
  it("lists one open market per configured ticker", async () => {
    const epoch = await client.getEpoch();
    expect(epoch.id).toBe("2026-09-11");
    const markets = await client.listMarkets(epoch.id);
    expect(markets.map((m) => m.ticker)).toEqual([...RECESS_CONFIG.tickers]);
    expect(markets.every((m) => m.status === "Open")).toBe(true);
  });

  it("is deterministic across instances", async () => {
    const a = await make().listMarkets("2026-09-11");
    const b = await make().listMarkets("2026-09-11");
    expect(a.map((m) => m.poolAbove)).toEqual(b.map((m) => m.poolAbove));
    expect(a.map((m) => m.fridayClose)).toEqual(b.map((m) => m.fridayClose));
  });

  it("locks on the schedule without being told", async () => {
    const late = make({ now: () => SUNDAY_NIGHT });
    const { epoch, market } = await firstMarket(late);
    expect(epoch.status).toBe("Locked");
    expect(market.status).toBe("Locked");
  });

  it("adds a stake to the chosen side and records the position", async () => {
    const { epoch, market } = await firstMarket();
    await client.approveUsdg(U(10));
    await client.stake(market.id, "Above", U(10));

    const after = await client.getMarket(epoch.id, market.ticker);
    expect(after!.poolAbove).toBe(market.poolAbove + U(10));
    const position = (await client.getPositions(ME)).find((p) => p.marketId === market.id);
    expect(position?.above).toBe(U(10));
    expect(await client.getUsdgBalance(ME)).toBe(U(5000) - U(10));
  });

  it("needs an allowance before it takes a stake", async () => {
    const { market } = await firstMarket();
    await expect(client.stake(market.id, "Above", U(10))).rejects.toThrow(/allowance/i);
  });

  it("refuses a stake once the market is locked", async () => {
    const { market } = await firstMarket();
    await client.approveUsdg(U(10));
    client.advanceTo("Locked");
    await expect(client.stake(market.id, "Above", U(10))).rejects.toThrow(/locked/i);
  });

  it("settles, names a winner and pays the winning side", async () => {
    const { epoch, market } = await firstMarket();
    await client.approveUsdg(U(100));
    await client.stake(market.id, "Above", U(10));
    await client.stake(market.id, "Below", U(10));

    client.advanceTo("Settled");
    expect((await client.getEpoch()).status).toBe("Settled");
    const settled = (await client.getMarket(epoch.id, market.ticker))!;
    expect(settled.status).toBe("Settled");
    expect(settled.winner).not.toBeNull();
    expect(settled.settlePrice).not.toBeNull();

    const position = (await client.getPositions(ME)).find((p) => p.marketId === market.id)!;
    const winningPool = settled.winner === "Above" ? settled.poolAbove : settled.poolBelow;
    const net = ((settled.poolAbove + settled.poolBelow) * BigInt(10_000 - RECESS_CONFIG.feeBps)) / 10_000n;
    expect(position.payout).toBe((U(10) * net) / winningPool);

    const before = await client.getUsdgBalance(ME);
    await client.claim(market.id);
    const claimed = (await client.getPositions(ME)).find((p) => p.marketId === market.id)!;
    expect(claimed.claimed).toBe(true);
    expect(await client.getUsdgBalance(ME)).toBe(before + position.payout!);
    await expect(client.claim(market.id)).rejects.toThrow(/already/i);
  });

  it("voids and refunds the whole stake, with no fee", async () => {
    const { epoch, market } = await firstMarket();
    await client.approveUsdg(U(20));
    await client.stake(market.id, "Above", U(10));

    client.advanceTo("Void");
    expect((await client.getMarket(epoch.id, market.ticker))!.status).toBe("Void");
    const position = (await client.getPositions(ME)).find((p) => p.marketId === market.id)!;
    expect(position.payout).toBe(U(10));
  });

  it("reports the hash before the transaction confirms", async () => {
    const { market } = await firstMarket();
    const onSubmitted = vi.fn();
    await client.approveUsdg(U(10), { onSubmitted });
    expect(onSubmitted).toHaveBeenCalledWith(expect.stringMatching(/^0x[0-9a-f]{64}$/));
    const hashes = new Set<string>();
    await client.stake(market.id, "Above", U(5), { onSubmitted: (h) => hashes.add(h) });
    await client.stake(market.id, "Above", U(5), { onSubmitted: (h) => hashes.add(h) });
    expect(hashes.size).toBe(2);
  });

  it("can be told to have the wallet reject, or the chain fail, the next transaction", async () => {
    const { epoch, market } = await firstMarket();
    await client.approveUsdg(U(10));

    client.setFailNext("reject");
    await expect(client.stake(market.id, "Above", U(10))).rejects.toThrow(/rejected/i);
    client.setFailNext("fail");
    await expect(client.stake(market.id, "Above", U(10))).rejects.toThrow(/reverted/i);

    expect((await client.getMarket(epoch.id, market.ticker))!.poolAbove).toBe(market.poolAbove);
    expect(await client.getUsdgBalance(ME)).toBe(U(5000));
    await client.stake(market.id, "Above", U(10));
    expect((await client.getMarket(epoch.id, market.ticker))!.poolAbove).toBe(market.poolAbove + U(10));
  });

  it("keeps the demo across reloads when given storage", async () => {
    const storage = memoryStorage();
    const first = make({ storage });
    const { market } = await firstMarket(first);
    await first.approveUsdg(U(10));
    await first.stake(market.id, "Below", U(10));
    first.advanceTo("Locked");

    const second = make({ storage });
    expect((await second.getEpoch()).status).toBe("Locked");
    expect((await second.getPositions(ME))[0].below).toBe(U(10));
  });

  it("tells subscribers when something changes", async () => {
    const { market } = await firstMarket();
    const onChange = vi.fn();
    const off = client.subscribe(onChange);
    await client.approveUsdg(U(10));
    await client.stake(market.id, "Above", U(10));
    expect(onChange).toHaveBeenCalledTimes(2);
    off();
    client.advanceTo("Locked");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("opens the next weekend when asked to open between weekends", async () => {
    const midweek = make({ now: () => WEDNESDAY });
    expect((await midweek.getEpoch()).status).toBe("Locked");
    midweek.advanceTo("Open");
    const epoch = await midweek.getEpoch();
    expect(epoch.id).toBe("2026-09-18");
    expect(epoch.status).toBe("Open");
    expect(epoch.lockTime).toBeGreaterThan(WEDNESDAY);
  });

  it("starts a fresh round when reopened after settlement", async () => {
    const { market } = await firstMarket();
    await client.approveUsdg(U(10));
    await client.stake(market.id, "Above", U(10));
    client.advanceTo("Void");
    await client.claim(market.id);
    client.advanceTo("Open");
    expect(await client.getPositions(ME)).toEqual([]);
    expect(await client.getUsdgBalance(ME)).toBe(U(5000));
  });
});
