import { Asset } from "@/components/ui/Asset";
import { Badge } from "@/components/ui/Badge";
import { BlurWords } from "@/components/ui/BlurWords";
import { Float } from "@/components/ui/Float";
import { Reveal } from "@/components/ui/Reveal";
import { COPY } from "@/lib/copy";

const TEXT = {
  fontFamily: "var(--font-inter)",
  fontSize: 17,
  lineHeight: 1.5,
  letterSpacing: "-0.01em",
} as const;

/**
 * Main brief 9, below 1024. The toggle group keeps its arrangement at about
 * 0.7 scale, then the two columns run as one centred stack with the tray coin
 * between them, so the reading order still matches the desktop composition.
 */
export function SolutionMobile() {
  return (
    <div className="relative flex flex-col items-center px-6 pb-16 pt-14 text-center lg:hidden">
      <div className="relative" style={{ width: 196, height: 145 }}>
        <div className="absolute" style={{ left: 0, top: 33, width: 196, height: 109 }} data-asset="solution/toggle.webp">
          <Float y={5} period={7} className="h-full w-full">
            <Asset src="solution/toggle.webp" intrinsic={{ w: 700, h: 400 }} />
          </Float>
        </div>
        <div className="absolute" style={{ left: 21, top: 0, width: 46, height: 42, zIndex: 2 }} data-asset="solution/bell.webp">
          <Float y={8} period={3.8} className="h-full w-full">
            <Asset src="solution/bell.webp" intrinsic={{ w: 200, h: 200 }} />
          </Float>
        </div>
        <div className="absolute" style={{ left: -37, top: 57, width: 49, height: 58, zIndex: 2 }} data-asset="solution/cursor.webp">
          <Float y={4} period={2.6} className="h-full w-full">
            <Asset src="solution/cursor.webp" intrinsic={{ w: 200, h: 240 }} />
          </Float>
        </div>
      </div>

      <Reveal className="mt-10">
        <Badge variant="glass" text={COPY.solution.badge} />
      </Reveal>

      <BlurWords
        as="h2"
        text={COPY.solution.h2}
        className="mt-6 max-w-[480px] text-white"
        style={{
          fontFamily: "var(--font-jakarta)",
          fontWeight: 500,
          fontSize: "clamp(28px, 6vw, 40px)",
          lineHeight: 1.2,
          textWrap: "balance",
        }}
      />

      <Reveal className="mt-10 max-w-[480px] text-white" style={TEXT}>
        {COPY.solution.left}
      </Reveal>

      <div className="my-10" style={{ width: 209, height: 147 }} data-asset="solution/tray-coin.webp">
        <Float y={6} period={5.2} className="h-full w-full">
          <Asset src="solution/tray-coin.webp" intrinsic={{ w: 700, h: 500 }} />
        </Float>
      </div>

      <Reveal className="max-w-[480px] text-white" style={TEXT}>
        {COPY.solution.right}
      </Reveal>
    </div>
  );
}
