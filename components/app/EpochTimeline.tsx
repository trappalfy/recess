import type { Market } from "@/lib/recess/types";
import { EtTime } from "./market-bits";
import { CARD, H2_STYLE } from "./styles";

/** Update §4: Friday close → Locked → Settled, with the current stage marked. */
export function EpochTimeline({ market, className = "" }: { market: Market; className?: string }) {
  const reached = market.status === "Open" ? 0 : market.status === "Locked" ? 1 : 2;
  const steps = [
    { label: "Friday close", when: <EtTime at={market.openTime} />, note: "Board opens, close recorded" },
    { label: "Locked", when: <EtTime at={market.lockTime} />, note: "Betting closes" },
    {
      label: market.status === "Void" ? "Void" : "Settled",
      when: "First print after the weekend",
      note: market.status === "Void" ? "Every stake refunded" : "Winning side claims",
    },
  ];

  return (
    <section aria-labelledby="timeline-title" className={`${CARD} p-6 sm:p-8 ${className}`}>
      <h2 id="timeline-title" className="text-ink" style={H2_STYLE}>
        Timeline
      </h2>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-4">
        {steps.map((step, i) => (
          <li key={i} aria-current={i === reached ? "step" : undefined} className="flex gap-4 sm:block">
            <div className="flex items-center gap-3 pt-1 sm:pt-0">
              <span
                aria-hidden="true"
                className={`h-3 w-3 shrink-0 rounded-full ${
                  i < reached
                    ? "bg-ink"
                    : i === reached
                      ? "bg-blue shadow-[0_0_0_4px_rgba(10,104,245,.15)]"
                      : "border-2 border-line bg-white"
                }`}
              />
              {i < steps.length - 1 && (
                <span aria-hidden="true" className={`hidden h-px flex-1 sm:block ${i < reached ? "bg-ink" : "bg-line"}`} />
              )}
            </div>
            <div className="sm:mt-4">
              <p className="text-[15px] text-ink" style={{ fontWeight: 500 }}>
                {step.label}
              </p>
              <p className="tabular mt-0.5 text-[14px] text-ink">{step.when}</p>
              <p className="mt-0.5 text-[13px] text-body">{step.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
