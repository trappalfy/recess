"use client";

import { Asset } from "@/components/ui/Asset";
import { AVAILABLE } from "@/lib/asset-manifest";
import { u } from "@/lib/u";

export const FOOTER_PLATE = "solution/footer.webp";
export const hasFooterPlate = AVAILABLE.has(FOOTER_PLATE);

/**
 * Trial, same as the hero: the last screen's illustration as one flat image.
 * It is bottom-aligned, because its lower coin is cut by the frame edge exactly
 * where the page ends, and its top dissolves into the section blue so no seam
 * shows under the slider card. Desktop only, like the hero; below 1024 the CTA
 * keeps its own half-size coins. Delete the file to get the layered CTA back.
 */
export function FooterPlate() {
  if (!hasFooterPlate) return null;
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 hidden lg:block"
      style={{
        width: u(1905),
        height: u(927),
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 22%)",
        maskImage: "linear-gradient(to bottom, transparent 0, #000 22%)",
      }}
      data-asset={FOOTER_PLATE}
      aria-hidden="true"
    >
      <Asset src={FOOTER_PLATE} intrinsic={{ w: 1798, h: 875 }} />
      <div className="grain blue-grain" />
    </div>
  );
}
