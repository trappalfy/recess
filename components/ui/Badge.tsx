import { Zap } from "lucide-react";
import { Mark } from "./Mark";

/**
 * Main brief 6.2 (light, on white) and 6.3 (glass, on blue).
 * Both are a pill with a trailing circle holding a small glyph.
 */
export function Badge({ variant, text }: { variant: "light" | "glass"; text: string }) {
  const light = variant === "light";
  return (
    <span
      className="inline-flex items-center rounded-full border border-line"
      style={{
        height: light ? 32 : 43,
        padding: light ? "0 6px 0 14px" : "0 8px 0 18px",
        gap: light ? 8 : 10,
        background: light ? "#F4F7FB" : "rgba(255,255,255,.40)",
        color: light ? "#010320" : "#FFFFFF",
        fontFamily: "var(--font-inter)",
        fontSize: 15,
        lineHeight: 1,
      }}
    >
      {text}
      <span
        className="inline-flex items-center justify-center rounded-full bg-blue text-white"
        style={{ width: light ? 20 : 22, height: light ? 20 : 22 }}
      >
        {light ? <Mark height={11} /> : <Zap size={12} aria-hidden="true" />}
      </span>
    </span>
  );
}
