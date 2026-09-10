"use client";

import { motion, useReducedMotion } from "motion/react";
import { u } from "@/lib/u";

/** Main brief 6.1: white dots with a soft glow. [x, y, diameter] */
const DOTS: Array<[number, number, number]> = [
  [920, 208, 10],
  [1357, 172, 12],
  [1301, 473, 8],
  [935, 497, 4],
  [1471, 210, 6],
  [1374, 516, 4],
  [1407, 540, 3],
];

/** Dashed run of four dots, 17px apart, from (472, 358). */
const DASH: Array<[number, number, number]> = [0, 1, 2, 3].map(
  (i) => [472 + i * 17, 358, 4] as [number, number, number]
);

/** Hairline strokes at about -22 degrees. [x, y, length] */
const STROKES: Array<[number, number, number]> = [
  [940, 205, 38],
  [952, 180, 38],
  [1380, 210, 96],
  [686, 313, 72],
  [1480, 260, 240],
];

export function HeroDecor() {
  const reduced = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 4 }} aria-hidden="true">
      {[...DOTS, ...DASH].map(([x, y, d], i) => (
        <motion.span
          key={`d${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: u(x),
            top: u(y),
            width: u(d),
            height: u(d),
            boxShadow: "0 0 12px rgba(255,255,255,.8)",
          }}
          animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={
            reduced
              ? undefined
              : { duration: 2.4 + (i % 5) * 0.3, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }
          }
        />
      ))}
      {STROKES.map(([x, y, len], i) => (
        <span
          key={`s${i}`}
          className="absolute"
          style={{
            left: u(x),
            top: u(y),
            width: u(len),
            height: 1,
            transform: "rotate(-22deg)",
            transformOrigin: "left center",
            background: "linear-gradient(90deg, rgba(255,255,255,.7), rgba(255,255,255,0))",
          }}
        />
      ))}
    </div>
  );
}
