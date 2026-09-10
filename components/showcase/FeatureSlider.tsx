"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpDown, Layers, ReceiptText } from "lucide-react";
import { COPY } from "@/lib/copy";
import { SlideSide } from "./SlideSide";
import { SlidePool } from "./SlidePool";
import { SlideSettle } from "./SlideSettle";

const ICONS = [ArrowUpDown, Layers, ReceiptText];
const SLIDES = [SlideSide, SlidePool, SlideSettle];
const DURATION = 4000;

/** Main brief 6.4 and 7.9. */
export function FeatureSlider() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !running) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(id);
  }, [active, running, reduced]);

  const Slide = SLIDES[active];

  return (
    <div
      ref={ref}
      data-testid="showcase-card"
      className="rounded-[32px] p-[22px]"
      style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_639px]">
        <div
          className="rounded-3xl px-11 py-10"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.16)" }}
        >
          {COPY.showcase.groups.map((group, i) => {
            const Icon = ICONS[i];
            return (
              <button
                key={group.title}
                type="button"
                aria-controls="showcase-panel"
                aria-expanded={active === i}
                onClick={() => setActive(i)}
                className="block w-full text-left transition-opacity duration-300 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
                style={{ opacity: active === i ? 1 : 0.45, marginTop: i === 0 ? 0 : 36 }}
              >
                <span className="flex items-center gap-3 text-white">
                  <Icon size={20} aria-hidden="true" />
                  <span
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontWeight: 500,
                      fontSize: 22,
                      lineHeight: 1.3,
                    }}
                  >
                    {group.title}
                  </span>
                </span>
                <ul className="mt-3">
                  {group.bullets.map(([lead, rest]) => (
                    <li
                      key={lead}
                      className="relative pl-[18px] text-white"
                      style={{ fontFamily: "var(--font-inter)", fontSize: 15, lineHeight: 1.5 }}
                    >
                      <span className="absolute left-0 top-[9px] h-1 w-1 rounded-full bg-white" />
                      <strong style={{ fontWeight: 600 }}>{lead}</strong> {rest}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div
          id="showcase-panel"
          aria-live="off"
          className="relative h-[440px] overflow-hidden rounded-3xl lg:h-[632px]"
          style={{ background: "#000320" }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0"
              initial={reduced ? { opacity: 0 } : { y: "100%" }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: "-18%", opacity: 0, scale: 0.96 }}
              transition={{ duration: reduced ? 0.2 : 0.7, ease: [0.65, 0, 0.35, 1] }}
            >
              <Slide />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-[30px] left-1/2 z-10 flex -translate-x-1/2 gap-[14px]">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show ${COPY.showcase.groups[i].title}`}
                onClick={() => setActive(i)}
                className="h-[3px] w-16 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,.22)" }}
              >
                <motion.span
                  className="block h-full bg-white"
                  initial={{ width: i < active ? "100%" : "0%" }}
                  animate={{ width: i <= active ? "100%" : "0%" }}
                  transition={{
                    duration: i === active && !reduced && running ? DURATION / 1000 : 0,
                    ease: "linear",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
