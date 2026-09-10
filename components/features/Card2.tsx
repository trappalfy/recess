import { RailTiles } from "./RailTiles";
import { COPY } from "@/lib/copy";

/** Main brief 6.2, card 2. */
export function Card2() {
  return (
    <div className="bento-card min-h-[560px] p-11 lg:h-[736px]">
      <p
        className="relative z-10 max-w-[340px] text-ink"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 20,
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
        }}
      >
        {COPY.features.card2.body}
      </p>
      <RailTiles />
    </div>
  );
}
