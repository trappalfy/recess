"use client";

import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";
import { COPY } from "@/lib/copy";

/** Main brief 6.4, slide 3. The glowing pill is code, not an image. */
export function SlideSettle() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-x-0 top-0 h-[300px]"
        animate={reduced ? undefined : { y: [-4, 4, -4] }}
        transition={reduced ? undefined : { duration: 4.5, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      >
        <Asset src="showcase/receipts.webp" intrinsic={{ w: 1300, h: 650 }} />
      </motion.div>
      <span
        className="absolute left-1/2 -translate-x-1/2 rounded-2xl"
        style={{ top: 300, width: 220, height: 110, border: "1px solid rgba(255,255,255,.18)" }}
        aria-hidden="true"
      />
      <span
        className="absolute left-1/2 flex h-[52px] -translate-x-1/2 items-center rounded-full px-8 text-white"
        style={{
          bottom: 120,
          background: "linear-gradient(180deg, #5BB0FF, #1E6FF5)",
          border: "1px solid rgba(255,255,255,.5)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 0 40px rgba(46,132,255,.6)",
          fontFamily: "var(--font-inter)",
          fontWeight: 500,
          fontSize: 20,
        }}
      >
        {COPY.showcase.slide3.pill}
      </span>
    </div>
  );
}
