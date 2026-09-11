"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

type Tone = "ok" | "error" | "pending";
type ToastItem = { id: number; message: string; href?: string; tone: Tone };
type PushOptions = { href?: string; tone?: Tone };
type Ctx = { push: (message: string, opts?: PushOptions) => number; dismiss: (id: number) => void };

const ToastCtx = createContext<Ctx>({ push: () => 0, dismiss: () => {} });
export const useToast = () => useContext(ToastCtx);

const LIFETIME_MS = 6000;
let nextId = 1;

/**
 * Update §5: a toast with an explorer link while a transaction is in flight, one
 * on success, and one naming the reason on failure. A pending toast stays until
 * the caller dismisses it. Update §7: same radius and border as the cards.
 */
export function ToastHost({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (message: string, opts?: PushOptions) => {
      const id = nextId++;
      const tone = opts?.tone ?? "ok";
      setItems((all) => [...all, { id, message, href: opts?.href, tone }]);
      if (tone !== "pending") setTimeout(() => dismiss(id), LIFETIME_MS);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:inset-x-auto sm:bottom-6 sm:right-6"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              data-testid="toast"
              className="pointer-events-auto flex w-full max-w-[380px] items-center gap-3 rounded-[32px] border border-line bg-white py-3 pl-6 pr-3 shadow-[0_20px_40px_rgba(1,3,32,.10)]"
              style={{ fontFamily: "var(--font-inter)", fontSize: 15 }}
            >
              {t.tone === "pending" && (
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-blue"
                />
              )}
              <span className={t.tone === "error" ? "text-[#C81E1E]" : "text-ink"}>{t.message}</span>
              {t.href && (
                <a
                  href={t.href}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-blue underline underline-offset-4"
                >
                  View
                </a>
              )}
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full text-body hover:text-ink"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
