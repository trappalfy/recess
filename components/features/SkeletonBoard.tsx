import { Asset } from "@/components/ui/Asset";
import { Mark } from "@/components/ui/Mark";

const TICKERS = ["HIMS", "NVDA", "TSLA"];

/** Main brief 6.2 card 4: a deliberately blurred, unreadable board. */
function Board({ dim }: { dim?: boolean }) {
  return (
    <div
      className="absolute left-1/2 w-[420px] max-w-full -translate-x-1/2 rounded-2xl bg-white p-4"
      style={{
        top: dim ? -14 : 0,
        height: 150,
        boxShadow: "0 20px 40px rgba(1,3,32,.06)",
        filter: "blur(1.5px)",
        opacity: dim ? 0.4 : 0.7,
      }}
      aria-hidden="true"
    >
      {TICKERS.map((t) => (
        <div key={t} className="flex items-center gap-3 py-[7px]">
          <span className="h-7 w-7 shrink-0 rounded-full bg-[#EEF1F6]" />
          <span className="tabular text-ink" style={{ fontFamily: "var(--font-inter)", fontSize: 14 }}>
            {t}
          </span>
          <span className="ml-auto h-[10px] w-[120px] rounded-full bg-[#EEF1F6]" />
          <span className="h-[10px] w-[60px] rounded-full bg-[#EEF1F6]" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonBoard() {
  return (
    <div className="relative mx-auto h-[164px] w-full max-w-[420px]">
      <Board dim />
      <Board />
      <div className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2">
        <Asset src="features/sphere-dark.webp" intrinsic={{ w: 260, h: 260 }} />
        <span className="absolute inset-0 flex items-center justify-center text-white">
          <Mark height={42} />
        </span>
      </div>
    </div>
  );
}
