"use client";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  delay = 0,
  stagger = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reduced
          ? { duration: 0.2 }
          : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay, staggerChildren: stagger }
      }
    >
      {children}
    </motion.div>
  );
}
