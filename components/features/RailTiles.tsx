"use client";

import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";

/**
 * Main brief 6.2 card 2 and 7.6. Centres and angles are provisional: once the
 * real rails image exists they must be re-measured against the actual groove
 * ends, and the travel paths taken from the drawn curves.
 */
const TILES = [
  { src: "features/tile-bell.webp", cx: 349, cy: 450, rot: -12, period: 5.5, phase: 0 },
  { src: "features/tile-down.webp", cx: 149, cy: 510, rot: 10, period: 6.2, phase: -1.4 },
  { src: "features/tile-pool.webp", cx: 366, cy: 590, rot: -6, period: 6.8, phase: -2.7 },
  { src: "features/tile-up.webp", cx: 203, cy: 690, rot: 12, period: 7.4, phase: -0.6 },
];

export function RailTiles() {
  const reduced = useReducedMotion();
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-[320px] lg:h-[386px]">
        <Asset
          src="features/rails.webp"
          intrinsic={{ w: 1100, h: 780 }}
          className="object-cover object-bottom"
        />
      </div>
      {TILES.map((t) => (
        <motion.div
          key={t.src}
          className="absolute hidden lg:block"
          style={{ left: t.cx - 28, top: t.cy - 28, width: 56, height: 56 }}
          animate={
            reduced
              ? undefined
              : { x: [-28, 28, -28], y: [-4, 4, -4], rotate: [t.rot - 3, t.rot + 3, t.rot - 3] }
          }
          transition={
            reduced
              ? undefined
              : { duration: t.period, repeat: Infinity, ease: [0.65, 0, 0.35, 1], delay: t.phase }
          }
        >
          <Asset src={t.src} intrinsic={{ w: 180, h: 180 }} />
        </motion.div>
      ))}
    </>
  );
}
