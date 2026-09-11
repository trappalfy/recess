"use client";

import { getMockClient } from "@/lib/recess/client";
import { isMock } from "@/lib/recess/config";
import type { MarketStatus } from "@/lib/recess/types";
import { useRecess } from "@/lib/recess/use-recess";

const STAGES: MarketStatus[] = ["Open", "Locked", "Settled", "Void"];

const pill = (active: boolean) =>
  `h-7 rounded-full border px-3 transition-colors duration-200 ${
    active ? "border-ink bg-white text-ink" : "border-line text-body hover:text-ink"
  }`;

function Controls() {
  const { data } = useRecess(async () => {
    const mock = getMockClient();
    return mock ? { forced: mock.forcedStage } : null;
  }, []);
  const mock = () => getMockClient();
  const forced = data ? data.forced : undefined;

  return (
    <div data-testid="demo-controls" className="border-b border-line bg-[#F8FAFC]">
      <div className="container-recess flex flex-wrap items-center gap-x-6 gap-y-2 py-2 text-[13px] text-body">
        <div role="group" aria-label="Demo stage" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1">Demo stage</span>
          <button
            type="button"
            aria-pressed={forced === null}
            onClick={() => mock()?.followLive()}
            className={pill(forced === null)}
            title="Follow the schedule and the reference feeds"
          >
            Live
          </button>
          {STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              aria-pressed={forced === stage}
              onClick={() => mock()?.advanceTo(stage)}
              className={pill(forced === stage)}
            >
              {stage}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => mock()?.reset()} className="underline underline-offset-4 hover:text-ink">
          Reset demo
        </button>
      </div>
    </div>
  );
}

/**
 * Update §9: a developer control that fast-forwards the weekend in mock mode, so
 * every stage of a market can be seen without waiting for it. Live returns to
 * the schedule and the reference feeds. Nothing renders in chain mode.
 */
export function DevEpochControls() {
  return isMock() ? <Controls /> : null;
}
