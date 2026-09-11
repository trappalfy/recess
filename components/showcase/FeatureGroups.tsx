import { ArrowUpDown, Layers, ReceiptText } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { COPY } from "@/lib/copy";

const ICONS = [ArrowUpDown, Layers, ReceiptText];

/**
 * Main brief 6.4, without the visual panel: the owner dropped it as a poor fit
 * for the section. With nothing left to switch between, the three groups sit
 * side by side at full strength instead of cycling as an accordion; below 1024
 * they stack.
 */
export function FeatureGroups() {
  return (
    <div
      data-testid="showcase-card"
      className="rounded-[32px] p-[22px]"
      style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {COPY.showcase.groups.map((group, i) => {
          const Icon = ICONS[i];
          return (
            <Reveal
              key={group.title}
              delay={i * 0.12}
              className="rounded-3xl px-6 py-7 lg:px-9 lg:py-9"
              style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.16)" }}
            >
              <h3
                className="flex items-center gap-3 text-white"
                style={{ fontFamily: "var(--font-jakarta)", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }}
              >
                <Icon size={20} aria-hidden="true" />
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.bullets.map(([lead, rest]) => (
                  <li
                    key={lead}
                    className="relative pl-[18px] text-white"
                    style={{ fontFamily: "var(--font-inter)", fontSize: 15, lineHeight: 1.5 }}
                  >
                    <span className="absolute left-0 top-[9px] h-1 w-1 rounded-full bg-white" />
                    <strong style={{ fontWeight: 600 }}>{lead}</strong> {rest}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
