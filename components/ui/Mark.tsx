export function Mark({ height, className }: { height: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 36 44"
      height={height}
      width={(height * 36) / 44}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="2" y="24" width="14" height="18" rx="4" />
      <rect x="20" y="2" width="14" height="18" rx="4" />
    </svg>
  );
}
