"use client";

import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import type { Market, Position, Side } from "@/lib/recess/types";
import { resolveAction } from "@/lib/recess/action-state";
import { estimateMultiplier, estimatePayout } from "@/lib/recess/math";
import { formatUsdg, parseUsdg, usdgToInput } from "@/lib/recess/format";
import { ENV, RECESS_CONFIG } from "@/lib/recess/config";
import { getClient } from "@/lib/recess/client";
import { useRecess } from "@/lib/recess/use-recess";
import { ConnectAction } from "./ConnectAction";
import { Row, SideDot, multiplierText } from "./market-bits";
import { useTx } from "./useTx";
import { ACTION_BTN, CARD, H2_STYLE } from "./styles";

const MIN_STAKE = parseUsdg(String(RECESS_CONFIG.minStake));

/** Digits and one decimal point, no more decimals than the token has. */
function cleanAmount(v: string): string {
  const [whole, ...rest] = v.replace(/[^\d.]/g, "").split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, RECESS_CONFIG.usdgDecimals)}` : whole;
}

/**
 * Update §4, the right-hand panel: side toggle, USDG amount with the wallet's
 * real balance and Max, the payout and multiplier estimate, and the action
 * button. The button takes its label and state from resolveAction alone, so
 * the order of update §5 cannot drift here.
 */
export function StakePanel({ market, position }: { market: Market; position: Position | null }) {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const tx = useTx();
  const [side, setSide] = useState<Side>("Above");
  const [raw, setRaw] = useState("");

  const { data: wallet } = useRecess(
    async (client) => {
      if (!address) return null;
      const [balance, allowance] = await Promise.allSettled([
        client.getUsdgBalance(address),
        client.getAllowance(address),
      ]);
      return {
        balance: balance.status === "fulfilled" ? balance.value : null,
        allowance: allowance.status === "fulfilled" ? allowance.value : null,
      };
    },
    [address],
  );
  const balance = wallet?.balance ?? null;
  const allowance = wallet?.allowance ?? null;

  const open = market.status === "Open";
  const amount = parseUsdg(raw);
  const action = resolveAction({
    status: market.status,
    connected: isConnected,
    rightNetwork: ENV.chainId === 0 || chainId === ENV.chainId,
    amount,
    balance,
    allowance,
    minStake: MIN_STAKE,
    side,
    pending: tx.pending,
  });

  const payout = estimatePayout(amount, market.poolAbove, market.poolBelow, side, RECESS_CONFIG.feeBps);
  const multiplier =
    payout !== null
      ? Number(payout) / Number(amount)
      : estimateMultiplier(market.poolAbove, market.poolBelow, side, RECESS_CONFIG.feeBps);
  const est = open ? ", est." : "";

  async function onAction() {
    const client = getClient();
    if (action.kind === "switch") {
      switchChain({ chainId: ENV.chainId });
    } else if (action.kind === "approve") {
      await tx.run((opts) => client.approveUsdg(amount, opts), "USDG approved");
    } else if (action.kind === "stake") {
      if (await tx.run((opts) => client.stake(market.id, side, amount, opts), "Stake placed")) setRaw("");
    }
  }

  return (
    <section data-testid="stake-panel" aria-labelledby="stake-title" className={`${CARD} p-6 sm:p-8`}>
      <h2 id="stake-title" className="text-ink" style={H2_STYLE}>
        Take a side
      </h2>

      <div role="group" aria-label="Side" className="mt-5 grid grid-cols-2 gap-3">
        {(["Above", "Below"] as const).map((s) => {
          const active = side === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              disabled={!open}
              onClick={() => setSide(s)}
              className={`flex h-[60px] flex-col items-center justify-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? "border-blue bg-blue text-white" : "border-line text-ink enabled:hover:border-ink"
              }`}
            >
              <span className="flex items-center gap-2 text-[16px]" style={{ fontWeight: 500 }}>
                <SideDot side={s} />
                {s}
              </span>
              <span className={`tabular text-[12px] ${active ? "text-white/80" : "text-body"}`}>
                {multiplierText(market, s)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-baseline justify-between text-[14px] text-body">
        <label htmlFor="stake-amount">Amount</label>
        <span className="tabular" data-testid="stake-balance">
          Balance {isConnected && balance !== null ? formatUsdg(balance) : "—"} USDG
        </span>
      </div>
      <div className="mt-2 flex h-14 items-center rounded-full border border-line pl-5 pr-2 focus-within:border-blue">
        <input
          id="stake-amount"
          data-testid="stake-amount"
          value={raw}
          onChange={(e) => setRaw(cleanAmount(e.target.value))}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          disabled={!open || tx.pending}
          className="tabular w-full min-w-0 bg-transparent text-[18px] text-ink outline-none placeholder:text-body disabled:cursor-not-allowed"
        />
        <span className="ml-2 text-[15px] text-body">USDG</span>
        <button
          type="button"
          onClick={() => balance !== null && setRaw(usdgToInput(balance))}
          disabled={!open || !isConnected || balance === null || tx.pending}
          className="ml-3 h-10 shrink-0 rounded-full bg-[#F1F4F9] px-4 text-[14px] text-ink transition-colors duration-200 enabled:hover:bg-[#E6EBF2] disabled:opacity-40"
        >
          Max
        </button>
      </div>
      <p className="tabular mt-2 text-[13px] text-body">Minimum stake {RECESS_CONFIG.minStake} USDG</p>

      <dl className="tabular mt-6 space-y-2 border-t border-line pt-5 text-[15px]">
        <Row label={`Payout if ${side} wins${est}`} value={payout !== null ? `${formatUsdg(payout)} USDG` : "—"} />
        <Row label={`Multiplier${est}`} value={multiplier !== null ? `${multiplier.toFixed(2)}x` : "—"} />
        <Row label="Protocol fee" value={`${RECESS_CONFIG.feeBps / 100}% of the pool`} />
      </dl>
      {open && (
        <p className="mt-3 text-[13px] leading-[1.45] text-body">
          Estimates move with every new stake until betting closes.
        </p>
      )}

      <div className="mt-6">
        {action.kind === "connect" ? (
          <ConnectAction label={action.label} />
        ) : (
          <button
            type="button"
            data-testid="stake-action"
            disabled={action.disabled}
            onClick={onAction}
            className={ACTION_BTN}
          >
            {action.label}
          </button>
        )}
      </div>

      {position && (
        <p data-testid="my-position" className="tabular mt-5 border-t border-line pt-5 text-[14px] text-body">
          Your position:{" "}
          {[
            position.above > 0n && `Above ${formatUsdg(position.above)} USDG`,
            position.below > 0n && `Below ${formatUsdg(position.below)} USDG`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </section>
  );
}
