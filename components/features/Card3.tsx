import Link from "next/link";
import { OrbitDots } from "./OrbitDots";
import { COPY } from "@/lib/copy";

/** Main brief 6.2 card 3, with the button retargeted to the app by update 2. */
export function Card3() {
  return (
    <div className="bento-card min-h-[420px] p-9 lg:h-[470px]">
      <OrbitDots />
      <p
        className="relative z-10 max-w-[300px] text-ink"
        style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: 18, lineHeight: 1.4 }}
      >
        {COPY.features.card3.body}
      </p>
      <Link
        href="/app"
        className="relative z-10 mt-8 inline-flex h-[52px] items-center rounded-full bg-blue px-7 text-white transition-colors duration-200 hover:bg-[#1F77F7] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue lg:absolute lg:left-9 lg:top-[55%] lg:mt-0"
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 500,
          fontSize: 18,
          boxShadow: "0 12px 30px rgba(10,104,245,.35)",
        }}
      >
        {COPY.features.card3.button}
      </Link>
    </div>
  );
}
