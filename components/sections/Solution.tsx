import { AssetBox } from "@/components/ui/AssetBox";
import { Asset } from "@/components/ui/Asset";
import { AVAILABLE } from "@/lib/asset-manifest";
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
/* Trial, same as the hero and footer: the Solution screen as one flat image.
   It is the reference frame with the section top at y 0, so it starts at the
   top of the blue section; it runs 29u past this block, and the block clips
   it there, which also drops the white corners at its bottom. While the file
   is present it replaces the toggle, bell, cursor and tray coin. */
const PLATE = "solution/solution.webp";
const PLATE_H = (1905 * 876) / 1796;

export function Solution() {
  const plate = AVAILABLE.has(PLATE);
  return (
    <>
      <SolutionMobile />
      <div
        className={`solution-artboard relative hidden lg:block ${plate ? "overflow-hidden" : ""}`}
      >
      {plate && (
        <div
          className="pointer-events-none absolute left-0 top-0"
          style={{
            width: u(1905),
            height: u(PLATE_H),
            /* The frame has white rounded corners at its bottom from 891u; fade the
               edge out just above them, below the tray coin (which ends at 872u). */
            WebkitMaskImage: "linear-gradient(to bottom, #000 94.17%, transparent 95.89%)",
            maskImage: "linear-gradient(to bottom, #000 94.17%, transparent 95.89%)",
          }}
          data-asset={PLATE}
          aria-hidden="true"
        >
          <Asset src={PLATE} intrinsic={{ w: 1796, h: 876 }} />
          <div className="grain blue-grain" />
        </div>
      )}

      {!plate && (<>
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
      </>)}

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
