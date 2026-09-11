import { sideShare } from "@/lib/recess/math";

/**
 * The Above / Below split of one pool, in the two side colours of update §7.
 * The width eases when a stake lands, which update §7 counts as a response to an action.
 */
export function SideBar({
  above,
  below,
  height = 8,
  className = "",
}: {
  above: bigint;
  below: bigint;
  height?: number;
  className?: string;
}) {
  const share = sideShare(above, below, "Above");
  const pct = Math.round(share * 100);
  return (
    <div
      role="img"
      aria-label={`Above holds ${pct} percent of the pool, Below ${100 - pct} percent`}
      className={`flex w-full overflow-hidden rounded-full bg-below ${className}`}
      style={{ height }}
    >
      <div
        className="h-full border-r-2 border-white bg-above transition-[width] duration-500 ease-out"
        style={{ width: `${share * 100}%` }}
      />
    </div>
  );
}
