"use client";

import { motion, useReducedMotion } from "motion/react";
import { Lockup } from "@/components/ui/Lockup";
import { BlurWords } from "@/components/ui/BlurWords";
import { LaunchPill } from "@/components/ui/LaunchPill";
import { AssetBox } from "@/components/ui/AssetBox";
import { Mark } from "@/components/ui/Mark";
import { HeroDecor } from "./HeroDecor";
import { COPY } from "@/lib/copy";
import { u } from "@/lib/u";

export function Hero() {
  const reduced = useReducedMotion();

  /** Main brief 7.1: illustration emerges from blur. */
  const rise = (delay: number) =>
    reduced
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.2 },
        }
      : {
          initial: { opacity: 0, filter: "blur(14px)", scale: 0.97 },
          animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
          transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay },
        };

  return (
    /* Below 1024 the proportional artboard shrinks faster than the fixed-size
       headline and pill inside it, so main brief 9 swaps in HeroMobile. */
    <section className="artboard-wrap hidden lg:block" data-testid="hero">
      <div className="artboard hero-artboard overflow-hidden">
        <div className="hero-bg" />
        <div className="grain hero-grain" />

        {/* Layer 2: coins behind the ribbon. */}
        <motion.div {...rise(0.15)}>
          <AssetBox
            src="hero/coin-tsla.webp"
            x={543} y={293} w={155} h={200} z={2}
            intrinsic={{ w: 900, h: 900 }}
            priority
            float={{ y: 8, rotate: 1, period: 6.8, phase: -3.1 }}
          />
          <AssetBox
            src="hero/coin-meta.webp"
            x={1205} y={158} w={185} h={175} z={2}
            intrinsic={{ w: 900, h: 900 }}
            priority
            float={{ y: 8, rotate: 1, period: 7.8, phase: -0.9 }}
          />
        </motion.div>

        {/* Layer 3: the ribbon. */}
        <motion.div {...rise(0.15)}>
          <AssetBox
            src="hero/ribbon.webp"
            x={0} y={250} w={1905} h={480} z={3}
            intrinsic={{ w: 3840, h: 968 }}
            priority
          />
        </motion.div>

        {/* Layer 4: coins and chips in front. */}
        <motion.div {...rise(0.21)}>
          <AssetBox
            src="hero/coin-nvda.webp"
            x={778} y={200} w={212} h={225} z={4}
            intrinsic={{ w: 600, h: 600 }}
            priority
            float={{ y: 12, rotate: 1.5, period: 6.4, phase: 0 }}
          />
          <AssetBox
            src="hero/coin-aapl.webp"
            x={993} y={108} w={165} h={165} z={4}
            intrinsic={{ w: 500, h: 500 }}
            priority
            float={{ y: 10, rotate: 2, period: 7.2, phase: -1.8 }}
          />
          <AssetBox
            src="hero/chip-up.webp"
            x={705} y={398} w={88} h={72} z={4}
            intrinsic={{ w: 300, h: 250 }}
            float={{ y: 6, period: 4.6, phase: -0.4 }}
          />
          <AssetBox
            src="hero/chip-bell.webp"
            x={1083} y={250} w={58} h={56} z={4}
            intrinsic={{ w: 200, h: 200 }}
            float={{ y: 6, period: 5.4, phase: -2.2 }}
          />
          <AssetBox
            src="hero/chip-clock.webp"
            x={473} y={573} w={40} h={40} z={4}
            intrinsic={{ w: 160, h: 160 }}
            float={{ y: 6, period: 5.0, phase: -1.1 }}
          />
          {/* Main brief 5: the mark sits on the blank chip. */}
          <div
            className="absolute"
            style={{ left: u(1395), top: u(313), width: u(40), height: u(40), zIndex: 4 }}
          >
            <AssetBox
              src="hero/chip-blank.webp"
              x={0} y={0} w={40} h={40} z={1}
              intrinsic={{ w: 160, h: 160 }}
            />
            <span
              className="absolute inset-0 flex items-center justify-center text-blue"
              style={{ zIndex: 2 }}
            >
              <Mark height={18} />
            </span>
          </div>
        </motion.div>

        <HeroDecor />

        {/* Layer 5: lockup, headline, pill. */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: u(46), zIndex: 5 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Lockup />
        </motion.div>

        <BlurWords
          as="h1"
          text={COPY.hero.h1}
          delay={0.35}
          data-testid="hero-h1"
          className="absolute left-1/2 w-full -translate-x-1/2 text-center text-ink"
          style={{
            /* 604 is the cap top from main brief 6.1; 16.5 compensates the font ascent. */
            top: u(587.5),
            zIndex: 5,
            fontFamily: "var(--font-jakarta)",
            fontWeight: 500,
            fontSize: "max(56px, calc(102 * var(--u)))",
            lineHeight: 1,
            letterSpacing: "-0.0075em",
          }}
        />

        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: u(836), zIndex: 5 }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0.2 : 0.6,
            delay: reduced ? 0 : 0.95,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <LaunchPill variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
