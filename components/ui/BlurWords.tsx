"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  as?: "h1" | "h2" | "h3";
  text: string | readonly string[];
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function BlurWords({
  as = "h2",
  text,
  delay = 0,
  className,
  style,
  ...rest
}: Props & Record<string, unknown>) {
  const reduced = useReducedMotion();
  const lines: readonly string[] = typeof text === "string" ? [text] : text;
  const plain = lines.join(" ");
  let index = 0;
  const Tag = motion[as];

  return (
    <Tag className={className} style={style} aria-label={plain} {...rest}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {line.split(" ").map((word) => {
            const i = index++;
            return (
              <motion.span
                key={`${li}-${i}`}
                className="inline-block whitespace-pre"
                initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 12 }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={
                  reduced
                    ? { duration: 0.2 }
                    : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.08 }
                }
              >
                {`${word} `}
              </motion.span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
