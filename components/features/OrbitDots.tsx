"use client";

import { motion, useReducedMotion } from "motion/react";

/** Main brief 6.2 card 3 and 7.7. Four rings, three carry an orbiting dot. */
const RINGS = [130, 190, 250, 310];
const DOTS = [
  { r: 190, dur: 16, dir: 1 },
  { r: 250, dur: 22, dir: -1 },
  { r: 310, dur: 28, dir: 1 },
];

export function OrbitDots() {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Centre sits at 45% of the card width, 40px below its bottom edge. */}
      <div className="absolute" style={{ left: "45%", top: "calc(100% + 40px)" }}>
        {RINGS.map((r) => (
          <span
            key={r}
            className="absolute rounded-full"
            style={{
              left: -r,
              top: -r,
              width: r * 2,
              height: r * 2,
              border: "1px solid var(--color-line-soft)",
            }}
          />
        ))}
        {DOTS.map(({ r, dur, dir }) => (
          <motion.div
            key={r}
            className="absolute"
            style={{ left: 0, top: 0, width: 0, height: 0 }}
            animate={reduced ? undefined : { rotate: dir * 360 }}
            transition={reduced ? undefined : { duration: dur, repeat: Infinity, ease: "linear" }}
          >
            <span
              className="absolute rounded-full bg-blue"
              style={{
                left: r - 5,
                top: -5,
                width: 10,
                height: 10,
                boxShadow: "0 0 0 4px rgba(10,104,245,.12)",
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
