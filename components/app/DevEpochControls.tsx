"use client";

import { getMockClient } from "@/lib/recess/client";
import { isMock } from "@/lib/recess/config";
import type { MockFailure } from "@/lib/recess/mock";
import type { MarketStatus } from "@/lib/recess/types";
import { useRecess } from "@/lib/recess/use-recess";

const STAGES: MarketStatus[] = ["Open", "Locked", "Settled", "Void"];

function Controls() {
  const { data } = useRecess(async () => {
    const mock = getMockClient();
    return mock ? { stage: mock.stage(), failNext: mock.failNext } : null;
  }, []);
  const mock = () => getMockClient();

  return (
    <div data-testid="demo-controls" className="border-b border-line bg-[#F8FAFC]">
      <div className="container-recess flex flex-wrap items-center gap-x-6 gap-y-2 py-2 text-[13px] text-body">
        <div role="group" aria-label="Demo stage" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1">Demo stage</span>
          {STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              aria-pressed={data?.stage === stage}
              onClick={() => mock()?.advanceTo(stage)}
              className={`h-7 rounded-full border px-3 transition-colors duration-200 ${
                data?.stage === stage ? "border-ink bg-white text-ink" : "border-line text-body hover:text-ink"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          Next transaction
          <select
            value={data?.failNext ?? ""}
            onChange={(e) => mock()?.setFailNext((e.target.value || null) as MockFailure | null)}
            className="h-7 rounded-full border border-line bg-white px-2 text-ink"
          >
            <option value="">Confirms</option>
            <option value="reject">Rejected in wallet</option>
            <option value="fail">Fails on chain</option>
          </select>
        </label>
        <button type="button" onClick={() => mock()?.reset()} className="underline underline-offset-4 hover:text-ink">
          Reset demo
        </button>
      </div>
    </div>
  );
}

/**
 * Update §9: a developer control that fast-forwards the weekend in mock mode,
 * so a settlement and a claim can be tried without waiting for Monday. It also
 * makes the next transaction fail, so update §5's error toasts can be seen.
 * Nothing renders in chain mode.
 */
export function DevEpochControls() {
  return isMock() ? <Controls /> : null;
}
