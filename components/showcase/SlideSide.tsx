"use client";

import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";

/** Main brief 6.4, slide 1. Rings are flat, so they are drawn in code. */
export function SlideSide() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 grid place-items-center">
      {[280, 420, 560].map((d) => (
        <span
          key={d}
          className="absolute rounded-full"
          style={{ width: d, height: d, border: "1.5px solid rgba(255,255,255,.28)" }}
        />
      ))}
      <motion.span
        className="absolute"
        style={{
          width: 420,
          height: 420,
          background: "radial-gradient(circle, rgba(164,140,254,.35), transparent 65%)",
        }}
        animate={reduced ? undefined : { opacity: [0.6, 1, 0.6] }}
        transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      />
      <div className="relative h-[260px] w-[260px]">
        <Asset src="showcase/orb.webp" intrinsic={{ w: 600, h: 600 }} />
      </div>
    </div>
  );
}
