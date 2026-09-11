"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lockup } from "@/components/ui/Lockup";
import { isMock } from "@/lib/recess/config";
import { formatUsdg } from "@/lib/recess/format";
import { useRecess } from "@/lib/recess/use-recess";
import { PILL_DARK } from "./styles";

const NAV = [
  { href: "/app", label: "Board" },
  { href: "/app/portfolio", label: "Portfolio" },
] as const;

function AppNav({ className = "" }: { className?: string }) {
  const path = usePathname();
  const inPortfolio = path.startsWith("/app/portfolio");
  return (
    <nav aria-label="App" className={`items-center gap-1 ${className}`}>
      {NAV.map((item) => {
        // Market pages belong to the board.
        const active = item.href === "/app" ? !inPortfolio : inPortfolio;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={path === item.href ? "page" : undefined}
            className={`flex h-9 items-center rounded-full px-4 text-[15px] transition-colors duration-200 ${
              active ? "bg-[#F1F4F9] text-ink" : "text-body hover:text-ink"
            }`}
            style={{ fontFamily: "var(--font-inter)", fontWeight: 500 }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Update §6: always visible in mock mode, so demo figures are never taken for real ones. */
function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`h-7 items-center gap-2 rounded-full border border-line px-3 text-[13px] text-ink ${className}`}
      title="Every figure in the app is demonstration data, not a live market."
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue" />
      Demo data
    </span>
  );
}

function WalletButton() {
  const { address } = useAccount();
  const { data: balance } = useRecess(
    (client) => (address ? client.getUsdgBalance(address) : Promise.resolve(null)),
    [address],
  );

  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openConnectModal, openAccountModal, openChainModal }) => {
        if (!mounted) return <span aria-hidden="true" className="block h-10 w-[140px]" />;
        if (!account) {
          return (
            <button type="button" onClick={openConnectModal} className={PILL_DARK}>
              Connect wallet
            </button>
          );
        }
        if (chain?.unsupported) {
          return (
            <button type="button" onClick={openChainModal} className={PILL_DARK}>
              Switch network
            </button>
          );
        }
        const hasBalance = balance !== undefined && balance !== null;
        return (
          <button
            type="button"
            onClick={openAccountModal}
            data-testid="account-chip"
            className="flex h-10 items-center gap-3 rounded-full border border-line bg-white px-4 text-[14px] text-ink transition-colors duration-200 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue"
          >
            {hasBalance && <span className="tabular">{formatUsdg(balance)} USDG</span>}
            {hasBalance && <span aria-hidden="true" className="hidden h-4 w-px bg-line sm:block" />}
            <span className={hasBalance ? "hidden sm:inline" : ""}>{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

/**
 * Update §4: lockup to the landing on the left, Board and Portfolio in the
 * centre, the wallet on the right with its address and USDG balance. On a white
 * ground the lockup turns ink. Below 768 the nav drops to a second row.
 */
export function AppHeader() {
  const mock = isMock();
  return (
    <header className="border-b border-line bg-white">
      <div className="container-recess relative flex h-[68px] items-center gap-4">
        <Lockup markHeight={24} wordSize={28} gap={8} className="text-ink" />
        <AppNav className="hidden md:absolute md:left-1/2 md:flex md:-translate-x-1/2" />
        <div className="ml-auto flex items-center gap-3">
          {mock && <DemoBadge className="hidden md:inline-flex" />}
          <WalletButton />
        </div>
      </div>
      <div className="container-recess flex h-12 items-center justify-between md:hidden">
        <AppNav className="-ml-4 flex" />
        {mock && <DemoBadge className="inline-flex" />}
      </div>
    </header>
  );
}
