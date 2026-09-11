import { test, expect, type Page } from "@playwright/test";
import { RECESS_CONFIG } from "../../lib/recess/config";

/**
 * A real USDG holder on Robinhood Chain: the burn address, which holds USDG that
 * can never move out, so its balance barely changes. It is read live from the
 * chain in the test and compared with the page.
 */
const HOLDER = "0x000000000000000000000000000000000000dEaD";
const RH_RPC = "https://rpc.mainnet.chain.robinhood.com";
const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168";
const ROBINHOOD_CHAIN = "0x1237"; // 4663
/** Saturday Sep 12 2026, noon in New York: the Sep 11 board is open for stakes. */
const SATURDAY_NOON = new Date("2026-09-12T16:00:00Z");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("recess-jurisdiction-ack", "1"));
});

/**
 * A browser wallet as an extension injects it (EIP-1193). It holds HOLDER and
 * forwards every read to Robinhood Chain; it never signs.
 */
async function injectWallet(page: Page, chainId = ROBINHOOD_CHAIN) {
  await page.addInitScript(
    ({ account, chainId, rpc }) => {
      const listeners: Record<string, ((arg: unknown) => void)[]> = {};
      let chain = chainId;
      // The visitor changing network in the extension, as a test step.
      (window as unknown as { __walletChain: (id: string) => void }).__walletChain = (id) => {
        chain = id;
        (listeners.chainChanged ?? []).forEach((fn) => fn(id));
      };
      // Like an extension, it shares the account only once the visitor has approved the site.
      let approved = false;
      (window as unknown as { ethereum: unknown }).ethereum = {
        isMetaMask: true,
        request: async ({ method, params }: { method: string; params?: unknown[] }) => {
          switch (method) {
            case "eth_requestAccounts":
              approved = true;
              return [account];
            case "eth_accounts":
              return approved ? [account] : [];
            case "eth_chainId":
              return chain;
            case "net_version":
              return String(parseInt(chain, 16));
            case "wallet_requestPermissions":
              approved = true;
              return [{ parentCapability: "eth_accounts" }];
            case "wallet_getPermissions":
              return approved ? [{ parentCapability: "eth_accounts" }] : [];
            case "wallet_switchEthereumChain":
              chain = (params?.[0] as { chainId: string }).chainId;
              (listeners.chainChanged ?? []).forEach((fn) => fn(chain));
              return null;
            default: {
              const r = await fetch(rpc, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
              }).then((res) => res.json());
              if (r.error) throw r.error;
              return r.result;
            }
          }
        },
        on: (event: string, fn: (arg: unknown) => void) => {
          (listeners[event] ??= []).push(fn);
        },
        removeListener: (event: string, fn: (arg: unknown) => void) => {
          listeners[event] = (listeners[event] ?? []).filter((f) => f !== fn);
        },
      };
    },
    { account: HOLDER, chainId, rpc: RH_RPC },
  );
}

async function connect(page: Page) {
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.getByText("Browser Wallet").first().click();
}

/** The holder's USDG, read straight from the chain. */
async function liveBalance(): Promise<number> {
  const r = await fetch(RH_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to: USDG, data: "0x70a08231" + HOLDER.slice(2).padStart(64, "0") }, "latest"],
    }),
  }).then((res) => res.json());
  return Number(BigInt(r.result)) / 1e6;
}

const shownAmount = (text: string) => Number(/([\d,]+\.\d{2}) USDG/.exec(text)![1].replace(/,/g, ""));

/**
 * The page reads the balance between two live reads taken around it, so what it
 * shows lies between them, give or take the rounding to cents. This holds even
 * for an active wallet whose balance moves while the test runs.
 */
const between = (shown: number, a: number, b: number) =>
  shown >= Math.min(a, b) - 0.01 && shown <= Math.max(a, b) + 0.01;

const action = (page: Page) => page.getByTestId("stake-action");
const sideButton = (page: Page, side: "Above" | "Below") =>
  page.getByRole("group", { name: "Side" }).getByRole("button", { name: new RegExp(side) });

test("the board lists a market for every configured ticker", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("market-row").filter({ visible: true })).toHaveCount(RECESS_CONFIG.tickers.length, {
    timeout: 30_000,
  });
});

test("prices come from the Chainlink reference feeds", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("price-note")).toContainText("Prices from Chainlink reference feeds", {
    timeout: 30_000,
  });
});

test("nothing in the app is demo: no badge, no demo panel, no demo wallet", async ({ page }) => {
  await injectWallet(page);
  await page.goto("/app");
  await expect(page.getByTestId("price-note")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/demo/i)).toHaveCount(0);
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await expect(page.getByText("Browser Wallet").first()).toBeVisible();
  await expect(page.getByText(/demo/i)).toHaveCount(0);
});

test("the epoch bar names the weekend and its status", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("epoch-bar")).toContainText(/Weekend of/);
  await expect(page.getByTestId("epoch-status")).toHaveText(/Open|Locked|Settled/);
});

test("a disconnected visitor is asked to connect before staking", async ({ page }) => {
  await page.clock.setFixedTime(SATURDAY_NOON);
  await page.goto("/app/NVDA");
  await expect(action(page)).toHaveText("Connect wallet", { timeout: 30_000 });
});

test("a real browser wallet shows its real USDG balance", async ({ page }) => {
  await injectWallet(page);
  await page.goto("/app");
  const before = await liveBalance();
  await connect(page);
  const chip = page.getByTestId("account-chip");
  await expect(chip).toContainText(/[\d,]+\.\d{2} USDG/, { timeout: 20_000 });
  await expect(chip).toContainText("0x00");
  const after = await liveBalance();
  expect(between(shownAmount(await chip.innerText()), before, after)).toBe(true);
});

test("the stake panel works in full, and the stake button does nothing until the contracts are live", async ({
  page,
}) => {
  await page.clock.setFixedTime(SATURDAY_NOON);
  await injectWallet(page);
  await page.goto("/app/NVDA");
  const before = await liveBalance();
  await connect(page);

  const balanceLine = page.getByTestId("stake-balance");
  await expect(balanceLine).toHaveText(/Balance [\d,]+\.\d{2} USDG/, { timeout: 20_000 });
  const balance = shownAmount(await balanceLine.innerText());
  expect(between(balance, before, await liveBalance())).toBe(true);

  await sideButton(page, "Below").click();
  await expect(sideButton(page, "Below")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("stake-amount").fill("0.5");
  await expect(action(page)).toHaveText("Minimum stake is 1 USDG");
  await page.getByTestId("stake-amount").fill("999999999");
  await expect(action(page)).toHaveText("Not enough USDG in your wallet");

  await page.getByRole("button", { name: "Max" }).click();
  expect(Math.abs(Number(await page.getByTestId("stake-amount").inputValue()) - balance)).toBeLessThan(0.01);
  await page.getByTestId("stake-amount").fill("10");
  await expect(page.getByText("Payout if Below wins, est.")).toBeVisible();
  await expect(action(page)).toHaveText("Stake on Below");

  await action(page).click();
  await page.waitForTimeout(2000);
  await expect(action(page)).toHaveText("Stake on Below");
  await expect(page.getByTestId("toast")).toHaveCount(0);
  await expect(page.getByTestId("stake-amount")).toHaveValue("10");
});

test("a wallet moved to another network is asked to switch back", async ({ page }) => {
  await page.clock.setFixedTime(SATURDAY_NOON);
  await injectWallet(page);
  await page.goto("/app/NVDA");
  await connect(page);
  await page.getByTestId("stake-amount").fill("10");
  await expect(action(page)).toHaveText("Stake on Above", { timeout: 20_000 });

  await page.evaluate(() => (window as unknown as { __walletChain: (id: string) => void }).__walletChain("0x1"));
  await expect(action(page)).toHaveText("Switch network");
  await expect(page.getByRole("banner").getByRole("button", { name: "Switch network" })).toBeVisible();

  await action(page).click();
  await expect(action(page)).toHaveText("Stake on Above");
});

test("the legal gate appears on a first visit", async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/app");
  await expect(page.getByRole("dialog")).toBeVisible();
  const accept = page.getByRole("button", { name: "Continue" });
  await expect(accept).toBeDisabled();
  await page.getByRole("checkbox").check();
  await accept.click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("the portfolio points an empty wallet back to the board", async ({ page }) => {
  await injectWallet(page);
  await page.goto("/app/portfolio");
  await expect(page.getByText("Connect a wallet to see your positions.")).toBeVisible();
  await connect(page);
  await expect(page.getByText("No open positions.")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("link", { name: "Pick a side on the board." }).click();
  await expect(page).toHaveURL(/\/app$/);
});

test("the landing no longer mentions a waitlist", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(/waitlist/i);
});
