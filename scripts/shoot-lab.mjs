// Dev helper: screenshot /lab at several story positions in one browser.
// node scripts/shoot-lab.mjs <outDir> <width> <height> <p1,p2,...> [key=value overrides...]
import { chromium } from "@playwright/test";
const [outDir, w, h, list, ...over] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto("http://localhost:3100/lab?clean", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const set = (k, v) =>
  page.evaluate(([k, v]) => {
    const el = document.querySelector(`[data-lab="${k}"]`);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, [k, v]);
for (const kv of over) await set(...kv.split("="));
for (const p of list.split(",")) {
  await set("p", p);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${outDir}/p${p}.png`, timeout: 60000 });
}
if (errs.length) console.log("ERRORS:\n" + [...new Set(errs)].slice(0, 8).join("\n"));
await b.close();
