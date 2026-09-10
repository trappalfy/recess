import { CircleCarousel } from "./CircleCarousel";
import { COPY } from "@/lib/copy";

/**
 * Main brief 6.2, card 1. Coordinates below are measured from the card's own
 * top-left corner, so the decoration sits in a layer that ignores the padding.
 * Arcs and connectors are flat, so they are drawn in code.
 */
export function Card1() {
  return (
    <div className="bento-card min-h-[620px] p-11 lg:h-[736px]">
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        {[-21, 761].map((cx) => (
          <span
            key={cx}
            className="absolute rounded-full"
            style={{
              left: cx - 95,
              top: 85,
              width: 190,
              height: 190,
              border: "1px solid var(--color-line-soft)",
            }}
          />
        ))}
        {([[74, 154], [585, 666]] as const).map(([x1, x2]) => (
          <span
            key={x1}
            className="absolute"
            style={{ left: x1, top: 180, width: x2 - x1, height: 1, background: "var(--color-line-soft)" }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <CircleCarousel />
      </div>

      {/* Below lg the decoration is hidden, so the pill rides in the flow instead. */}
      <div className="relative mb-8 h-[203px] scale-[.8] lg:hidden">
        <CircleCarousel />
      </div>

      <h3
        className="text-ink lg:mt-[324.6px]"
        style={{
          fontFamily: "var(--font-jakarta)",
          fontWeight: 500,
          fontSize: "clamp(40px, 7vw, 76.8px)",
          lineHeight: 1,
          textWrap: "balance",
        }}
      >
        {COPY.features.card1.h3}
      </h3>
      <p
        className="mt-[18px] max-w-[580px] text-body"
        style={{ fontFamily: "var(--font-inter)", fontSize: 18, lineHeight: 1.4 }}
      >
        {COPY.features.card1.body}
      </p>
    </div>
  );
}
