import { test, expect, type Page } from "@playwright/test";
import { RECESS_CONFIG } from "../../lib/recess/config";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("recess-jurisdiction-ack", "1"));
});

const stage = (page: Page, name: "Live" | "Open" | "Locked" | "Settled" | "Void") =>
  page.getByRole("group", { name: "Demo stage" }).getByRole("button", { name, exact: true }).click();

const action = (page: Page) => page.getByTestId("stake-action");
const sideButton = (page: Page, side: "Above" | "Below") =>
  page.getByRole("group", { name: "Side" }).getByRole("button", { name: new RegExp(side) });

async function connectDemoWallet(page: Page) {
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.getByText("Demo wallet").first().click();
  await expect(page.getByTestId("account-chip")).toContainText("5,000.00 USDG");
}

test("the board lists a market for every configured ticker", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("market-row").filter({ visible: true })).toHaveCount(RECESS_CONFIG.tickers.length);
});

test("prices come from the Chainlink reference feeds", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByTestId("price-note")).toContainText("Prices from Chainlink reference feeds", {
    timeout: 30_000,
  });
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

test("a locked market closes the panel, and Live returns to the schedule", async ({ page }) => {
  await page.goto("/app/NVDA");
  await stage(page, "Locked");
  await expect(action(page)).toHaveText("Betting is closed. Settles at the open.");
  await expect(action(page)).toBeDisabled();
  await stage(page, "Live");
  await expect(page.getByRole("button", { name: "Live", exact: true })).toHaveAttribute("aria-pressed", "true");
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

test("the panel works in full, but buttons that would sign a transaction do nothing", async ({ page }) => {
  await page.goto("/app/NVDA");
  await stage(page, "Open");
  await connectDemoWallet(page);

  await sideButton(page, "Below").click();
  await expect(sideButton(page, "Below")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("stake-amount").fill("0.5");
  await expect(action(page)).toHaveText("Minimum stake is 1 USDG");
  await page.getByTestId("stake-amount").fill("999999");
  await expect(action(page)).toHaveText("Not enough USDG in your wallet");
  await page.getByTestId("stake-amount").fill("10");
  await expect(page.getByText("Payout if Below wins, est.")).toBeVisible();
  await expect(action(page)).toHaveText("Approve USDG");

  await action(page).click();
  await page.waitForTimeout(2500);
  await expect(action(page)).toHaveText("Approve USDG");
  await expect(page.getByTestId("toast")).toHaveCount(0);
  await expect(page.getByTestId("stake-amount")).toHaveValue("10");
  await expect(page.getByTestId("account-chip")).toContainText("5,000.00 USDG");

  await stage(page, "Settled");
  await expect(page.getByText("You had no stake in this market.")).toBeVisible();
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
