export function Wordmark({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-jakarta)",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
    >
      recess
    </span>
  );
}
