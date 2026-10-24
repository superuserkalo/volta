// Dev helper: screenshot the real page at the middle of every beat.
// node scripts/shoot-journey.mjs <outDir> <width> <height> [fraction=0.5]
import { chromium } from "@playwright/test";
const [outDir, w, h, frac = "0.5"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto(process.env.URL ?? "http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const ids = await page.$$eval("section[data-beat]", (els) => els.map((e) => e.id));
for (const id of ids) {
  await page.evaluate(([id, f]) => {
    const el = document.getElementById(id);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * f);
  }, [id, +frac]);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${outDir}/${w}-${id}.png`, timeout: 60000 });
}
if (errs.length) console.log("ERRORS:\n" + [...new Set(errs)].slice(0, 8).join("\n"));
await b.close();
