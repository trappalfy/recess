"use client";

import { u } from "@/lib/u";
import { Asset } from "./Asset";
import { Float } from "./Float";

export function AssetBox({
  src,
  x,
  y,
  w,
  h,
  z = 1,
  intrinsic,
  priority,
  float,
}: {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  intrinsic: { w: number; h: number };
  priority?: boolean;
  float?: { y: number; rotate?: number; period: number; phase?: number };
}) {
  const box = (
    <div style={{ width: "100%", height: "100%" }}>
      <Asset src={src} intrinsic={intrinsic} priority={priority} />
    </div>
  );
  return (
    <div
      className="absolute"
      style={{ left: u(x), top: u(y), width: u(w), height: u(h), zIndex: z }}
      data-asset={src}
    >
      {float ? (
        <Float {...float} className="h-full w-full">
          {box}
        </Float>
      ) : (
        box
      )}
    </div>
  );
}
