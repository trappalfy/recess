import { describe, it, expect } from "vitest";
import { lastAtOrBefore, firstFreshAfter, type Round } from "../../lib/recess/prices";

/** Rounds 1..n written 100 time units apart from t = 1000. */
function feed(answers: number[]) {
  const rounds: Round[] = answers.map((v, i) => ({ agg: i + 1, answer: BigInt(v), updatedAt: 1000 + i * 100 }));
  let calls = 0;
  const read = async (agg: number) => {
    calls++;
    return rounds[agg - 1];
  };
  return { read, latest: rounds.length, calls: () => calls };
}

describe("lastAtOrBefore", () => {
  const answers = [100, 101, 102, 102, 102, 105, 104, 103];

  it("finds the round in effect at a moment", async () => {
    const f = feed(answers);
    expect((await lastAtOrBefore(f.read, f.latest, 1250))?.agg).toBe(3);
    expect((await lastAtOrBefore(f.read, f.latest, 1300))?.agg).toBe(4);
  });

  it("has nothing before the first round", async () => {
    const f = feed(answers);
    expect(await lastAtOrBefore(f.read, f.latest, 999)).toBeNull();
  });

  it("reads a logarithmic number of rounds", async () => {
    const f = feed(Array.from({ length: 1024 }, (_, i) => i));
    await lastAtOrBefore(f.read, f.latest, 50_000);
    expect(f.calls()).toBeLessThanOrEqual(11);
  });
});

describe("firstFreshAfter", () => {
  const answers = [100, 101, 102, 102, 102, 105, 104, 103];

  it("skips heartbeat repeats of the value in effect at the lock", async () => {
    // Lock at 1250, where round 3 (102) is in effect; rounds 4 and 5 repeat it, round 6 moved.
    const f = feed(answers);
    expect((await firstFreshAfter(f.read, f.latest, 1250, 102n))?.agg).toBe(6);
  });

  it("does not take a repeat of Friday's late trading for a fresh print", async () => {
    // Close 100 at round 1, late trading moves it to 103 before the lock at 1150;
    // round 3 repeats 103 on the heartbeat, round 4 is the first real move.
    const f = feed([100, 103, 103, 104]);
    const atLock = await lastAtOrBefore(f.read, f.latest, 1150);
    expect((await firstFreshAfter(f.read, f.latest, 1150, atLock!.answer))?.agg).toBe(4);
  });

  it("takes the first round after the lock when the price moved", async () => {
    const f = feed(answers);
    expect((await firstFreshAfter(f.read, f.latest, 1050, 100n))?.agg).toBe(2);
  });

  it("has no print while nothing was written after the lock", async () => {
    const f = feed(answers);
    expect(await firstFreshAfter(f.read, f.latest, 1700, 103n)).toBeNull();
  });

  it("has no print while only repeats followed", async () => {
    const f = feed([100, 102, 102, 102]);
    expect(await firstFreshAfter(f.read, f.latest, 1150, 102n)).toBeNull();
  });
});
