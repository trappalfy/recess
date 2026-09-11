import { test, expect, type Page } from "@playwright/test";
import { RECESS_CONFIG } from "../../lib/recess/config";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("recess-jurisdiction-ack", "1"));
});

const stage = (page: Page, name: "Open" | "Locked" | "Settled" | "Void") =>
  page.getByRole("group", { name: "Demo stage" }).getByRole("button", { name, exact: true }).click();

const action = (page: Page) => page.getByTestId("stake-action");
const toast = (page: Page, text: string) => page.getByTestId("toast").filter({ hasText: text }).first();

async function connectDemoWallet(page: Page) {
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.getByText("Demo wallet").first().click();
  await expect(page.getByTestId("account-chip")).toContainText("5,000.00 USDG");
}

/** Approve then stake, the two transactions update §5 asks for. */
async function stake(page: Page, side: "Above" | "Below", amount: string) {
  await page.getByRole("group", { name: "Side" }).getByRole("button", { name: new RegExp(side) }).click();
  await page.getByTestId("stake-amount").fill(amount);
  await expect(action(page)).toHaveText("Approve USDG");
  await action(page).click();
  await expect(action(page)).toHaveText(`Stake on ${side}`);
  await action(page).click();
  await expect(toast(page, "Stake placed")).toBeVisible();
}

test("the board lists a market for every configured ticker", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("market-row").filter({ visible: true })).toHaveCount(RECESS_CONFIG.tickers.length);
});

test("the demo badge is visible while the app runs on mock data", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByText("Demo data").filter({ visible: true })).toBeVisible();
});

test("the epoch bar names the weekend and its status", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("epoch-bar")).toContainText(/Weekend of/);
  await expect(page.getByTestId("epoch-status")).toHaveText(/Open|Locked|Settled/);
});

test("a disconnected visitor is asked to connect before staking", async ({ page }) => {
  await page.goto("/app");
  await stage(page, "Open");
  await page.getByRole("link", { name: "Take a side" }).first().click();
  await expect(action(page)).toHaveText("Connect wallet");
});

test("a locked market closes the panel", async ({ page }) => {
  await page.goto("/app/NVDA");
  await stage(page, "Locked");
  await expect(action(page)).toHaveText("Betting is closed. Settles at the open.");
  await expect(action(page)).toBeDisabled();
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

test("update §9: stake both sides, settle and claim, then void and refund", async ({ page }) => {
  await page.goto("/app/NVDA");
  await stage(page, "Open");
  await connectDemoWallet(page);

  await page.getByTestId("stake-amount").fill("0.5");
  await expect(action(page)).toHaveText("Minimum stake is 1 USDG");
  await page.getByTestId("stake-amount").fill("999999");
  await expect(action(page)).toHaveText("Not enough USDG in your wallet");

  await stake(page, "Above", "10");
  await stake(page, "Below", "5");
  await expect(page.getByTestId("my-position")).toHaveText("Your position: Above 10.00 USDG · Below 5.00 USDG");

  await stage(page, "Settled");
  await expect(action(page)).toHaveText("Claim");
  await action(page).click();
  await expect(toast(page, "Payout claimed")).toBeVisible();
  await expect(page.getByText(/^Claimed [\d,.]+ USDG\.$/)).toBeVisible();

  await stage(page, "Open");
  await stake(page, "Above", "10");
  await stage(page, "Void");
  await action(page).click();
  await expect(toast(page, "Refund received")).toBeVisible();
  await expect(page.getByText("Refunded 10.00 USDG.")).toBeVisible();
});

test("update §5: a wallet rejection and a chain failure each name themselves", async ({ page }) => {
  await page.goto("/app/TSLA");
  await stage(page, "Open");
  await connectDemoWallet(page);
  await page.getByTestId("stake-amount").fill("10");

  await page.getByLabel("Next transaction").selectOption("reject");
  await action(page).click();
  await expect(toast(page, "Transaction rejected in wallet")).toBeVisible();

  await page.getByLabel("Next transaction").selectOption("fail");
  await action(page).click();
  await expect(action(page)).toHaveText("Confirming…");
  await expect(toast(page, "Transaction failed. Try again.")).toBeVisible();
  await expect(action(page)).toHaveText("Approve USDG");
});

test("the portfolio points an empty wallet back to the board", async ({ page }) => {
  await page.goto("/app/portfolio");
  await expect(page.getByText("Connect a wallet to see your positions.")).toBeVisible();
  await connectDemoWallet(page);
  await expect(page.getByText("No open positions.")).toBeVisible();
  await page.getByRole("link", { name: "Pick a side on the board." }).click();
  await expect(page).toHaveURL(/\/app$/);
});

test("the landing no longer mentions a waitlist", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(/waitlist/i);
});
