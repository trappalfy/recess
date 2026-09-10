import { SkeletonBoard } from "./SkeletonBoard";
import { COPY } from "@/lib/copy";

/** Main brief 6.2, card 4. */
export function Card4() {
  return (
    <div className="bento-card min-h-[460px] p-9 lg:h-[470px]">
      <SkeletonBoard />
      <h3
        className="mt-8 text-ink"
        style={{
          fontFamily: "var(--font-jakarta)",
          fontWeight: 500,
          fontSize: "clamp(30px, 4.5vw, 48px)",
          lineHeight: 1.1,
        }}
      >
        {COPY.features.card4.h3}
      </h3>
      <p
        className="mt-3 max-w-[520px] text-body"
        style={{ fontFamily: "var(--font-inter)", fontSize: 18, lineHeight: 1.4 }}
      >
        {COPY.features.card4.body}
      </p>
    </div>
  );
}
