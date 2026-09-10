import { AssetBox } from "@/components/ui/AssetBox";
import { Badge } from "@/components/ui/Badge";
import { BlurWords } from "@/components/ui/BlurWords";
import { Reveal } from "@/components/ui/Reveal";
import { SolutionMobile } from "./SolutionMobile";
import { COPY } from "@/lib/copy";
import { u } from "@/lib/u";

/**
 * Main brief 6.3. Coordinates are measured from the top of the blue section.
 * Both columns are right-aligned, as on the reference screenshot, and there are
 * no manual line breaks: the reference leaves single words hanging, appendix B
 * says not to copy that.
 */
export function Solution() {
  return (
    <>
      <SolutionMobile />
      <div className="solution-artboard relative hidden lg:block">
      <AssetBox
        src="solution/toggle.webp"
        x={830} y={40} w={280} h={155} z={2}
        intrinsic={{ w: 700, h: 400 }}
        float={{ y: 5, period: 7 }}
      />
      <AssetBox
        src="solution/bell.webp"
        x={860} y={0} w={66} h={60} z={3}
        intrinsic={{ w: 200, h: 200 }}
        float={{ y: 8, period: 3.8 }}
      />
      <AssetBox
        src="solution/cursor.webp"
        x={778} y={122} w={70} h={83} z={3}
        intrinsic={{ w: 200, h: 240 }}
        float={{ y: 4, period: 2.6 }}
      />
      <AssetBox
        src="solution/tray-coin.webp"
        x={803} y={670} w={298} h={210} z={2}
        intrinsic={{ w: 700, h: 500 }}
        float={{ y: 6, period: 5.2 }}
      />

      <Reveal className="absolute left-1/2 -translate-x-1/2" style={{ top: u(262) }}>
        <Badge variant="glass" text={COPY.solution.badge} />
      </Reveal>

      <BlurWords
        as="h2"
        text={COPY.solution.h2}
        data-testid="solution-h2"
        className="absolute left-1/2 -translate-x-1/2 text-center text-white"
        style={{
          /* 352 is the cap top; the subtraction covers the font's ascent gap. */
          top: u(342.9),
          width: u(1110),
          fontFamily: "var(--font-jakarta)",
          fontWeight: 500,
          fontSize: "clamp(30px, 5vw, 56px)",
          lineHeight: 1.2,
          textWrap: "balance",
        }}
      />

      <Reveal
        className="absolute text-right text-white"
        style={{
          left: u(406), top: u(680), width: u(360),
          fontFamily: "var(--font-inter)", fontSize: 20, lineHeight: 1.4, letterSpacing: "-0.01em",
        }}
      >
        {COPY.solution.left}
      </Reveal>
      <Reveal
        className="absolute text-right text-white"
        style={{
          left: u(1143), top: u(668), width: u(360),
          fontFamily: "var(--font-inter)", fontSize: 20, lineHeight: 1.4, letterSpacing: "-0.01em",
        }}
      >
        {COPY.solution.right}
      </Reveal>
      </div>
    </>
  );
}
