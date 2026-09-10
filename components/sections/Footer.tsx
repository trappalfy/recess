import Link from "next/link";
import { X, Send, GitBranch, BookOpen } from "lucide-react";
import { COPY } from "@/lib/copy";

/**
 * Links stay placeholders until corrective brief section 10 supplies them.
 * These are neutral glyphs, not brand marks: lucide dropped its brand icons,
 * and main brief section 1 rules out company logos anyway. Each link carries
 * an aria-label, so the destination is still announced correctly.
 */
const SOCIALS = [
  { Icon: X, label: "X" },
  { Icon: Send, label: "Telegram" },
  { Icon: GitBranch, label: "GitHub" },
  { Icon: BookOpen, label: "Docs" },
];

export function Footer() {
  return (
    <footer
      className="container-recess relative z-10 flex flex-col items-center gap-6 text-white md:block"
      /* Main brief 6.5: about 42px from the social icon centres to the page bottom. */
      style={{ paddingBottom: 42 }}
      data-testid="footer"
    >
      <div className="order-2 text-center md:order-1 md:max-w-[560px] md:text-left">
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 16, lineHeight: 1.4 }}>
          {COPY.footer.copyright}
        </p>
        <p
          className="mt-1"
          style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "rgba(255,255,255,.6)" }}
        >
          {COPY.footer.disclaimer}
        </p>
        <p
          className="mt-2 flex justify-center gap-4 md:justify-start"
          style={{ fontFamily: "var(--font-inter)", fontSize: 13 }}
        >
          <Link href="/terms" className="underline underline-offset-4">
            {COPY.footer.terms}
          </Link>
          <Link href="/risk" className="underline underline-offset-4">
            {COPY.footer.risk}
          </Link>
        </p>
      </div>

      {/* Main brief 6.5: centres at x 844 / 916 / 988 / 1060, so the row is
          centred on the page rather than pushed to the right edge. */}
      <ul className="order-1 flex gap-[22px] md:absolute md:left-1/2 md:top-0 md:order-2 md:-translate-x-1/2">
        {SOCIALS.map(({ Icon, label }) => (
          <li key={label}>
            <a
              href="#"
              aria-label={label}
              className="flex h-[50px] w-[50px] items-center justify-center rounded-full transition-colors duration-200 hover:bg-[rgba(255,255,255,.1)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
              style={{ border: "1px solid rgba(255,255,255,.22)" }}
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
