import { expect, test, type Page } from "@playwright/test";

type VoltaWindow = Window & { __volta?: { story: { get(): number } } };

test.beforeEach(async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 768, "phone layout only");
  await page.goto("/");
  await page.waitForFunction(() => (window as VoltaWindow).__volta);
});

/** The element a tap at the centre of `selector` would hit. */
const hitAt = (page: Page, selector: string) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel)!;
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { onTarget: !!hit && (hit === el || el.contains(hit)), top: r.top, bottom: r.bottom };
  }, selector);

test("the machine has a window at the top and the copy starts below it", async ({ page }) => {
  const { win, vh, copyTop, clip } = await page.evaluate(() => ({
    win: document.querySelector<HTMLElement>(".stage-shield")!.offsetHeight,
    vh: window.innerHeight,
    copyTop: document.querySelector("#hero .beat-copy")!.getBoundingClientRect().top,
    clip: getComputedStyle(document.querySelector("[data-stage]")!).clipPath,
  }));
  expect(win / vh).toBeGreaterThan(0.45);
  expect(win / vh).toBeLessThan(0.6);
  expect(copyTop).toBeGreaterThanOrEqual(win - 1);
  expect(clip).toContain("inset");
});

test("taps on the machine window never reach copy that scrolled under it", async ({ page }) => {
  // scroll the hero copy up under the window, then tap the window's middle
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.4));
  await page.waitForTimeout(200);
  const hit = await page.evaluate(() => {
    const win = document.querySelector<HTMLElement>(".stage-shield")!;
    const el = document.elementFromPoint(window.innerWidth / 2, win.offsetHeight / 2);
    return el?.classList.contains("stage-shield") ?? false;
  });
  expect(hit).toBe(true);
});

test("the hero form scrolls into view below the window and takes input", async ({ page }) => {
  await page.locator("#email-hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const hit = await hitAt(page, "#email-hero");
  expect(hit.onTarget).toBe(true);
  await page.locator("#email-hero").tap();
  await expect(page.locator("#email-hero")).toBeFocused();
});

test("the final CTA's form is free to use once the machine has left", async ({ page }) => {
  await page.locator("header a.chrome-cta").click();
  await page.waitForTimeout(1500);
  const hit = await hitAt(page, "#cta button[type=submit]");
  expect(hit.onTarget).toBe(true);
});
