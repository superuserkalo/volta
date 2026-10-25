import { chromium } from "@playwright/test";
const [w, h] = process.argv.slice(2).map(Number);
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: w, height: h } });
await page.goto(process.env.URL ?? "http://localhost:3100/", { waitUntil: "networkidle" });
const r = await page.evaluate(() => [...document.querySelectorAll("section[data-beat]")].map((s) => {
  const c = s.querySelector(".beat-copy");
  const slot = s.querySelector("[data-stage-slot]");
  return `${s.id}:${c.offsetHeight}` + (slot ? ` slot ${slot.offsetTop}+${slot.offsetHeight}` : "");
}));
console.log(`${w}x${h}`, r.join("  "));
await b.close();
