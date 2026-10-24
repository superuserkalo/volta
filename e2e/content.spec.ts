import { expect, test } from "@playwright/test";
import { copy } from "../src/content/copy";
import { BEATS } from "../src/story/beats";

test("all sections render in order with verbatim headlines", async ({ page }) => {
  await page.goto("/");
  const ids = await page.locator("section[data-beat]").evaluateAll((els) => els.map((e) => e.getAttribute("data-beat")));
  expect(ids).toEqual(BEATS.map((b) => b.id));

  const headlines = [
    copy.hero.headline[0],
    copy.pressure.headline,
    copy.temperature.headline,
    copy.control.headline,
    copy.power.headline,
    copy.repair.headline,
    copy.lab.headline,
    copy.cta.headline,
  ];
  for (const h of headlines) {
    const el = page.getByText(h, { exact: true }).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible();
  }
});

test("internals sections carry the prototype caption", async ({ page }) => {
  await page.goto("/");
  for (const id of ["pressure", "temperature", "repair"]) {
    await expect(page.locator(`#${id}`)).toContainText(copy.hero.caption);
  }
});

test("quote, footer links, and no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('img[alt="Benedict Heinzl"]')).toHaveCount(1);
  for (const l of copy.footer.links) {
    await expect(page.locator(`footer a[href="${l.href}"]`)).toHaveCount(1);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
