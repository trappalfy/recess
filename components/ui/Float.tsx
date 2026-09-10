"use client";

import { motion, useReducedMotion } from "motion/react";

export function Float({
  children,
  y = 10,
  rotate = 0,
  period = 6,
  phase = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  y?: number;
  rotate?: number;
  period?: number;
  phase?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      animate={{ y: [0, -y, 0], rotate: rotate ? [-rotate, rotate, -rotate] : undefined }}
      transition={{
        duration: period,
        ease: [0.65, 0, 0.35, 1],
        repeat: Infinity,
        repeatType: "loop",
        delay: phase,
      }}
    >
      {children}
    </motion.div>
  );
}
