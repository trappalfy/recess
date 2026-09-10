"use client";

import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";
import { COPY } from "@/lib/copy";

/** Main brief 6.4, slide 2. The front card is blank so the text is real HTML. */
export function SlidePool() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(#000, transparent)",
          WebkitMaskImage: "linear-gradient(#000, transparent)",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-[420px] w-[520px] -translate-x-1/2"
        animate={reduced ? undefined : { y: [-4, 4, -4] }}
        transition={reduced ? undefined : { duration: 5, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      >
        <Asset src="showcase/stack.webp" intrinsic={{ w: 1100, h: 900 }} />
        <div className="absolute inset-x-0 top-[120px] flex flex-col items-center gap-3 text-center">
          <div className="h-16 w-16">
            <Asset src="showcase/icon-up.webp" intrinsic={{ w: 180, h: 180 }} />
          </div>
          <p
            className="text-white"
            style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 28 }}
          >
            {COPY.showcase.slide2.title}
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "rgba(255,255,255,.7)" }}>
            {COPY.showcase.slide2.sub}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
