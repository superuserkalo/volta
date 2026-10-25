// Dev helper: screenshot the page at given story positions (beat index + fraction).
// node scripts/shoot-at.mjs <outDir> <width> <height> <p1> [p2 ...]
import { chromium } from "@playwright/test";
const [outDir, w, h, ...ps] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await page.goto(process.env.URL ?? "http://localhost:3100/", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
for (const p of ps) {
  await page.evaluate((p) => {
    const els = [...document.querySelectorAll("section[data-beat]")];
    const i = Math.min(els.length - 1, Math.floor(p));
    const el = els[i];
    document.documentElement.style.scrollSnapType = "none";
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * (p - i));
  }, +p);
  await page.waitForTimeout(+(process.env.WAIT ?? 1800));
  await page.screenshot({ path: `${outDir}/${w}-p${p}.png`, timeout: 60000 });
}
if (errs.length) console.log("ERRORS:\n" + [...new Set(errs)].slice(0, 8).join("\n"));
await b.close();
