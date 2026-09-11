import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app/AppHeader";
import { EpochBar } from "@/components/app/EpochBar";
import { DevEpochControls } from "@/components/app/DevEpochControls";
import { LegalGate } from "@/components/app/LegalGate";
import { ToastHost } from "@/components/app/Toast";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: { default: "Board — Recess", template: "%s — Recess" },
};

/** Update §4 and §7: the app shell on white, no hero and no 3D objects. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastHost>
      <div className="flex min-h-screen flex-col bg-white">
        <AppHeader />
        <EpochBar />
        <DevEpochControls />
        <main className="container-recess flex-1 py-8 md:py-10">{children}</main>
        <footer className="border-t border-line">
          <div className="container-recess flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-[13px] text-body">
            <span>{COPY.footer.disclaimer}</span>
            <span className="flex gap-4">
              <Link href="/terms" className="underline underline-offset-4 hover:text-ink">
                {COPY.footer.terms}
              </Link>
              <Link href="/risk" className="underline underline-offset-4 hover:text-ink">
                {COPY.footer.risk}
              </Link>
            </span>
          </div>
        </footer>
      </div>
      <LegalGate />
    </ToastHost>
  );
}
