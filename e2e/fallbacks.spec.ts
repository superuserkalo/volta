import { expect, test } from "@playwright/test";
import { copy } from "../src/content/copy";

const headlines = [copy.pressure.headline, copy.repair.headline, copy.cta.headline];

test("3D stage loads and the poster fades out", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-stage] canvas")).toHaveCount(1, { timeout: 15_000 });
  await expect(page.locator("[data-stage]")).toHaveAttribute("data-ready", "true", { timeout: 15_000 });
  await expect.poll(() => page.locator("[data-poster]").evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.05);
});

test("without WebGL: poster stays, copy readable, signup works", async ({ page }) => {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error test override
    HTMLCanvasElement.prototype.getContext = function (type: string, ...rest: unknown[]) {
      if (type === "webgl2" || type === "webgl") return null;
      return orig.call(this, type, ...rest);
    };
  });
  await page.goto("/");
  await expect(page.locator("[data-stage]")).toHaveAttribute("data-stage", "static");
  await expect(page.locator("[data-stage] canvas")).toHaveCount(0);
  await expect(page.locator("[data-poster]")).toBeVisible();
  for (const h of headlines) {
    const el = page.getByText(h, { exact: true }).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  const form = page.locator("#hero form");
  await form.getByPlaceholder(copy.hero.placeholder).fill("ana@example.com");
  await form.getByRole("button", { name: copy.hero.cta }).click();
  await expect(page.locator("#hero").getByText(copy.hero.success)).toBeVisible();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no canvas, text visible immediately", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-stage]")).toHaveAttribute("data-stage", "static");
    await expect(page.locator("[data-stage] canvas")).toHaveCount(0);
    await page.locator("#control").scrollIntoViewIfNeeded();
    const opacity = await page.locator("#control h2").evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBe(1);
  });
});

test("poster shows while the 3D is still loading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-poster]")).toBeVisible({ timeout: 2000 });
  const box = await page.locator("[data-poster]").boundingBox();
  expect(box!.width).toBeGreaterThan(300);
});
