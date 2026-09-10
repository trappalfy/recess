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
    return (
      <div
        data-placeholder={src}
        aria-hidden="true"
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-[6px] border border-dashed border-[rgba(10,104,245,.45)] bg-[rgba(10,104,245,.12)] text-center ${className ?? ""}`}
      >
        <span className="px-1 font-mono text-[10px] leading-[1.15] break-all text-[rgba(10,104,245,.9)]">
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
