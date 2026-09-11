import Link from "next/link";
import type { SVGProps } from "react";
import { COPY } from "@/lib/copy";

/**
 * The X mark, path from Simple Icons (CC0). lucide dropped its brand icons, and
 * its own "X" is a close cross, which reads as a close button, not a social link.
 */
function XMark({ size = 18, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

/**
 * Links stay placeholders until corrective brief section 10 supplies them.
 * The owner kept X as the only social link. The aria-label names the network,
 * because a bare "X" is read out like a close button.
 */
const SOCIALS = [{ Icon: XMark, label: "X (Twitter)" }];

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

      {/* Centred on the page, as the brief's four-icon row was (its centre, x 952). */}
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
