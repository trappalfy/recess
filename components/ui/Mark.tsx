import Image from "next/image";

/** Width over height of public/brand/mark.webp; npm run brand prints it. */
const ASPECT = 1.2617;

/**
 * The Recess mark, cut from the logo master (recess-logo.png) by npm run brand.
 * Every place that shows the mark goes through here (main brief 5). It is a lit
 * 3D render, so it is an image rather than a vector and keeps its own silver
 * colour wherever it sits; the placeholder it replaces took currentColor.
 */
export function Mark({
  height,
  className,
  priority = false,
}: {
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/mark.webp"
      alt=""
      aria-hidden="true"
      width={Math.round(height * ASPECT)}
      height={height}
      priority={priority}
      draggable={false}
      className={className}
    />
  );
}
