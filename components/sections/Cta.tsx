"use client";

import { motion, useReducedMotion } from "motion/react";
import { Asset } from "@/components/ui/Asset";
import { AssetBox } from "@/components/ui/AssetBox";
import { BlurWords } from "@/components/ui/BlurWords";
import { Float } from "@/components/ui/Float";
import { Reveal } from "@/components/ui/Reveal";
import { LaunchPill } from "@/components/ui/LaunchPill";
import { Mark } from "@/components/ui/Mark";
import { COPY } from "@/lib/copy";
import { u } from "@/lib/u";

const DOTS: Array<[number, number, number]> = [
  [400, 550, 12],
  [1536, 453, 8],
];

/** Main brief 6.5, with y measured from the bottom of the slider card. */
export function Cta() {
  const reduced = useReducedMotion();
  return (
    /* Height stops where the footer row begins (main brief 6.5: socials centred
       at y 780). Clipping is left to the blue section so the bottom coin can run
       past the footer to the page edge, as on the reference. Below 768 the block
       follows its content and only the two coins stay, at half size. */
    <div className="cta-artboard relative" data-testid="cta">
      <div className="hidden lg:block">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -80 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0.2 : 1.1, delay: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AssetBox
            src="hero/coin-meta.webp"
            x={40}
            y={263}
            w={355}
            h={347}
            z={1}
            intrinsic={{ w: 900, h: 900 }}
            float={{ y: 8, rotate: 1, period: 7.8, phase: -0.9 }}
          />
        </motion.div>

        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 100 }}
          whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0.2 : 1.1, delay: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AssetBox
            src="hero/coin-tsla.webp"
            x={1380}
            y={555}
            w={405}
            h={405}
            z={1}
            intrinsic={{ w: 900, h: 900 }}
            float={{ y: 8, rotate: 1, period: 6.8, phase: -3.1 }}
          />
        </motion.div>

        <AssetBox
          src="hero/chip-up.webp"
          x={325}
          y={592}
          w={62}
          h={56}
          z={2}
          intrinsic={{ w: 300, h: 250 }}
          float={{ y: 6, period: 4.8 }}
        />
        <AssetBox
          src="hero/chip-bell.webp"
          x={1555}
          y={482}
          w={52}
          h={50}
          z={2}
          intrinsic={{ w: 200, h: 200 }}
          float={{ y: 6, period: 5.2 }}
        />

        {DOTS.map(([x, y, d]) => (
          <span
            key={x}
            className="absolute rounded-full bg-white"
            style={{
              left: u(x),
              top: u(y),
              width: u(d),
              height: u(d),
              boxShadow: "0 0 12px rgba(255,255,255,.8)",
            }}
          />
        ))}
      </div>

      {/* Main brief 9: below 1024 the coins halve and hang off both edges. */}
      <div className="lg:hidden">
        <div
          className="absolute"
          style={{ left: -40, top: 24, width: 178, height: 174, zIndex: 1 }}
          data-asset="hero/coin-meta.webp"
        >
          <Float y={6} rotate={1} period={7.8} phase={-0.9} className="h-full w-full">
            <Asset src="hero/coin-meta.webp" intrinsic={{ w: 900, h: 900 }} />
          </Float>
        </div>
        <div
          className="absolute"
          style={{ right: -60, bottom: -24, width: 203, height: 203, zIndex: 1 }}
          data-asset="hero/coin-tsla.webp"
        >
          <Float y={6} rotate={1} period={6.8} phase={-3.1} className="h-full w-full">
            <Asset src="hero/coin-tsla.webp" intrinsic={{ w: 900, h: 900 }} />
          </Float>
        </div>
      </div>

      <div
        className="cta-body relative flex flex-col items-center px-6 py-20 text-center lg:pb-10"
        style={{ zIndex: 3 }}
      >
        <motion.div
          className="flex h-24 w-24 items-center justify-center rounded-3xl text-white"
          style={{
            background: "linear-gradient(180deg, #26FADE, #0EE8CC)",
            boxShadow: "0 14px 30px rgba(0,20,80,.25)",
          }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduced ? 0.2 : 0.6 }}
        >
          <Mark height={46} />
        </motion.div>

        <BlurWords
          as="h2"
          text={COPY.cta.h2}
          delay={0.15}
          data-testid="cta-h2"
          className="mt-8 text-white lg:mt-[53px]"
          style={{
            fontFamily: "var(--font-jakarta)",
            fontWeight: 500,
            fontSize: "clamp(36px, 6vw, 64px)",
            lineHeight: 1.1,
          }}
        />

        <Reveal delay={0.6}>
          <p
            className="mt-6"
            style={{ fontFamily: "var(--font-inter)", fontSize: 18, color: "rgba(255,255,255,.80)" }}
          >
            {COPY.cta.lead}
          </p>
        </Reveal>

        <Reveal delay={0.6} className="mt-8 flex w-full justify-center">
          <LaunchPill variant="cta" id="board" />
        </Reveal>
      </div>
    </div>
  );
}
