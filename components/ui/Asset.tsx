"use client";

import Image from "next/image";
import { AVAILABLE } from "@/lib/asset-manifest";

export function Asset({
  src,
  intrinsic,
  alt = "",
  priority = false,
  className,
}: {
  src: string;
  intrinsic: { w: number; h: number };
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!AVAILABLE.has(src)) {
    /* Neutral grey so the slot stays readable on the white sections and on the
       blue one alike. The label sits in its own dark chip for the same reason. */
    return (
      <div
        data-placeholder={src}
        aria-hidden="true"
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-[6px] border border-dashed border-[rgba(120,124,140,.85)] bg-[rgba(140,146,165,.22)] text-center ${className ?? ""}`}
      >
        <span className="mx-1 rounded-[3px] bg-[rgba(1,3,32,.72)] px-1 py-[1px] font-mono text-[10px] leading-[1.15] break-all text-white">
          {src}
        </span>
      </div>
    );
  }
  return (
    <Image
      src={`/images/${src}`}
      alt={alt}
      width={intrinsic.w}
      height={intrinsic.h}
      priority={priority}
      aria-hidden={alt === "" ? true : undefined}
      className={`h-full w-full object-contain ${className ?? ""}`}
    />
  );
}
