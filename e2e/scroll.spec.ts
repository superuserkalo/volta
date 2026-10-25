import { expect, test, type Page } from "@playwright/test";
import { beatAt } from "../src/story/position";

type VoltaWindow = Window & { __volta?: { story: { get(): number } } };

const storyP = (page: Page) => page.evaluate(() => (window as VoltaWindow).__volta!.story.get());
const beatNow = async (page: Page) => beatAt(await storyP(page)).id;

async function scrollToBeat(page: Page, id: string, fraction: number) {
  await page.evaluate(
    ([id, f]) => {
      const el = document.getElementById(id as string)!;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + el.offsetHeight * (f as number));
    },
    [id, fraction] as const,
  );
  await page.waitForTimeout(150);
}

test("story position follows scroll", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  await scrollToBeat(page, "power", 0.5);
  const p = await storyP(page);
  expect(p).toBeGreaterThan(5.4);
  expect(p).toBeLessThan(5.6);
});

test("header CTA jumps to the final section", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  await page.locator("header a.chrome-cta").click();
  await expect.poll(() => beatNow(page), { timeout: 1500 }).toBe("cta");
});

test("reload mid-page keeps the current beat", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  await scrollToBeat(page, "power", 0.4);
  await page.reload();
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  await expect.poll(() => beatNow(page)).toBe("power");
});

test("resize keeps the current beat", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  await scrollToBeat(page, "temperature", 0.5);
  const size = page.viewportSize()!;
  await page.setViewportSize({ width: size.height, height: size.width });
  await page.waitForTimeout(300);
  expect(await beatNow(page)).toBe("temperature");
});

test("progress rail appears in the numbered sections", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  const rail = page.locator("[data-progress-rail]");
  await expect(rail).toHaveAttribute("data-visible", "false");
  await scrollToBeat(page, "pressure", 0.4);
  await expect(rail).toHaveAttribute("data-visible", "true");
});

test("revealed text is visible once its section is on screen", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  await scrollToBeat(page, "control", 0.3);
  const h = page.locator("#control h2");
  await expect.poll(() => h.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.95);
});

test("header turns solid after scrolling", async ({ page }) => {
  await page.goto("/");
  const header = page.locator("header.chrome-header");
  const bg = () => header.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await bg()).toBe("rgba(0, 0, 0, 0)");
  await page.mouse.wheel(0, 400);
  await expect.poll(bg).not.toBe("rgba(0, 0, 0, 0)");
});

test("reloading at the bottom never flashes the hero machine", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: "domcontentloaded" });
  const poster = page.locator(".stage-poster");
  expect(await poster.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.05);
});

test("the battery section has no scroll snap stops", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#power [data-gate]")).toHaveCount(0);
});

test("the quote has a scroll gate at its activation point", async ({ page }) => {
  await page.goto("/");
  const gate = page.locator("#quote [data-gate]");
  await expect(gate).toHaveCount(1);
  const snap = await gate.evaluate((el) => [getComputedStyle(el).scrollSnapAlign, getComputedStyle(el).scrollSnapStop]);
  expect(snap).toEqual(["start", "always"]);
});
