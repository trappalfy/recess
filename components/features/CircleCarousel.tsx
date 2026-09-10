"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";

const DISCS = [
  "features/circle-blue.webp",
  "features/circle-dark.webp",
  "features/circle-lilac.webp",
];

/** Main brief 6.2: slots at x 202 / 311 / 420, step 109, overlap 18. */
const SLOT_X = [202, 311, 420];
/** Middle slot on top, then left, then right. */
const SLOT_Z = [2, 3, 1];

export function CircleCarousel() {
  const reduced = useReducedMotion();
  const [order, rotate] = useReducer((o: number[]) => [...o.slice(1), o[0]], [0, 1, 2]);
  const [moving, setMoving] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const id = setInterval(() => {
      setMoving(order[0]);
      rotate();
      setTimeout(() => setMoving(null), 600);
    }, 2200);
    return () => clearInterval(id);
  }, [reduced, visible, order]);

  return (
    <div ref={ref} className="absolute" style={{ left: 154, top: 80, width: 431, height: 203 }}>
      <div
        className="absolute inset-0 rounded-full bg-white"
        style={{ border: "1px solid #EEF1F6", boxShadow: "0 24px 48px -12px rgba(10,104,245,.14)" }}
      />
      {DISCS.map((src, disc) => {
        const slot = order.indexOf(disc);
        const isMoving = moving === disc;
        return (
          <motion.div
            key={src}
            className="absolute"
            style={{ top: 38, width: 127, height: 127, zIndex: isMoving ? 0 : SLOT_Z[slot] }}
            animate={{
              left: SLOT_X[slot] - 154,
              scale: isMoving ? [1, 0.9, 1] : 1,
              y: isMoving ? [0, -6, 0] : 0,
            }}
            transition={{ duration: reduced ? 0 : 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <Asset src={src} intrinsic={{ w: 300, h: 300 }} />
          </motion.div>
        );
      })}
    </div>
  );
}
