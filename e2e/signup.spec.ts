import { expect, test } from "@playwright/test";
import { copy } from "../src/content/copy";
import { notices } from "../src/content/allowed-edits";

test("hero signup succeeds with surrounding spaces", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("#hero form");
  await form.getByPlaceholder(copy.hero.placeholder).fill("  ana@example.com ");
  await form.getByRole("button", { name: copy.hero.cta }).click();
  await expect(page.locator("#hero").getByText(copy.hero.success)).toBeVisible();
});

test("double-click submits once", async ({ page }) => {
  await page.goto("/");
  let posts = 0;
  page.on("request", (r) => {
    if (r.method() === "POST" && r.headers()["next-action"]) posts++;
  });
  const form = page.locator("#hero form");
  await form.getByPlaceholder(copy.hero.placeholder).fill("ana@example.com");
  await form.getByRole("button", { name: copy.hero.cta }).dblclick();
  await expect(page.locator("#hero").getByText(copy.hero.success)).toBeVisible();
  expect(posts).toBe(1);
});

test("invalid email keeps the form and sends nothing", async ({ page }) => {
  await page.goto("/");
  let posts = 0;
  page.on("request", (r) => {
    if (r.method() === "POST") posts++;
  });
  const form = page.locator("#hero form");
  const input = form.getByPlaceholder(copy.hero.placeholder);
  await input.fill("not-an-email");
  await form.getByRole("button", { name: copy.hero.cta }).click();
  await expect(input).toBeVisible();
  expect(await input.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
  expect(posts).toBe(0);
});

test("both forms show the unofficial notice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(notices.signup)).toHaveCount(2);
});
