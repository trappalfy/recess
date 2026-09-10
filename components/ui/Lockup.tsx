import Link from "next/link";
import { Mark } from "./Mark";
import { Wordmark } from "./Wordmark";

export function Lockup({
  markHeight = 34,
  wordSize = 40,
  gap = 10,
  className = "text-white",
}: {
  markHeight?: number;
  wordSize?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <Link href="/" aria-label="Recess" className={`inline-flex items-center ${className}`} style={{ gap }}>
      <Mark height={markHeight} />
      <Wordmark size={wordSize} />
    </Link>
  );
}
