"use client";

import { motion, useReducedMotion } from "motion/react";
import { Lockup } from "@/components/ui/Lockup";
import { BlurWords } from "@/components/ui/BlurWords";
import { LaunchPill } from "@/components/ui/LaunchPill";
import { Asset } from "@/components/ui/Asset";
import { Float } from "@/components/ui/Float";
import { COPY } from "@/lib/copy";

/**
 * Main brief 9, hero below 1024. Height follows content. The illustration keeps
 * the desktop arrangement inside a block that is one viewport wide but stops
 * growing at 560, so the coins stay coin-sized on a tablet; --hw is one percent
 * of that block, so every coordinate below reads as a percentage of it. The
 * ribbon overflows to 180 percent so its crest is still visible. coin-tsla, the
 * remaining chips and the hairline strokes are dropped at this width.
 */
const OBJECTS = [
  { src: "hero/coin-meta.webp", left: 68, top: 12, width: 26, ratio: 175 / 185, z: 1, intrinsic: { w: 900, h: 900 }, float: { y: 6, period: 7.8, phase: -0.9 } },
  { src: "hero/coin-nvda.webp", left: 18, top: 10, width: 30, ratio: 225 / 212, z: 3, intrinsic: { w: 600, h: 600 }, float: { y: 8, period: 6.4, phase: 0 } },
  { src: "hero/coin-aapl.webp", left: 48, top: 2, width: 24, ratio: 1, z: 3, intrinsic: { w: 500, h: 500 }, float: { y: 7, period: 7.2, phase: -1.8 } },
  { src: "hero/chip-up.webp", left: 8, top: 34, width: 12, ratio: 72 / 88, z: 3, intrinsic: { w: 300, h: 250 }, float: { y: 5, period: 4.6, phase: -0.4 } },
];

const hw = (n: number) => `calc(${n} * var(--hw))`;

export function HeroMobile() {
  const reduced = useReducedMotion();
  return (
    <section className="hero-mobile relative overflow-hidden lg:hidden" data-testid="hero-mobile">
      <div className="hero-bg" />
      <div className="grain hero-grain" />

      <div
        className="relative flex flex-col items-center px-6 pb-12 pt-6"
        style={{ ["--hw" as string]: "min(1vw, 5.6px)" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Lockup markHeight={24} wordSize={28} gap={7} />
        </motion.div>

        <motion.div
          className="relative mt-6"
          style={{ width: hw(100), height: hw(72) }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(14px)" }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: reduced ? 0.2 : 0.9, delay: reduced ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: hw(26), width: hw(180), height: hw(45), zIndex: 2 }}
            data-asset="hero/ribbon.webp"
          >
            <Asset src="hero/ribbon.webp" intrinsic={{ w: 3840, h: 968 }} priority />
          </div>

          {OBJECTS.map((o) => (
            <div
              key={o.src}
              className="absolute"
              style={{ left: hw(o.left), top: hw(o.top), width: hw(o.width), aspectRatio: `1 / ${o.ratio}`, zIndex: o.z }}
              data-asset={o.src}
            >
              <Float {...o.float} className="h-full w-full">
                <Asset src={o.src} intrinsic={o.intrinsic} priority />
              </Float>
            </div>
          ))}
        </motion.div>

        <BlurWords
          as="h1"
          text={COPY.hero.h1}
          delay={0.35}
          data-testid="hero-mobile-h1"
          className="mt-8 max-w-[640px] text-center text-ink"
          style={{
            fontFamily: "var(--font-jakarta)",
            fontWeight: 500,
            fontSize: "clamp(44px, 5.5vw, 62px)",
            lineHeight: 1,
            letterSpacing: "-0.0075em",
          }}
        />

        <motion.div
          className="mt-8 w-full max-w-[460px]"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <LaunchPill variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
