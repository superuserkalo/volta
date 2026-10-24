import { chromium } from "@playwright/test";
const [url, out, w = "1440", h = "900", ...pairs] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
for (const pair of pairs) {
  const [k, v] = pair.split("=");
  await p.evaluate(([k, v]) => {
    const el = document.querySelector(`[data-lab="${k}"]`);
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true }));
  }, [k, v]);
}
await p.waitForTimeout(1500);
await p.screenshot({ path: out });
if (errs.length) console.log("ERRORS:\n" + errs.slice(0, 8).join("\n"));
await b.close();
