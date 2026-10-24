import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copy } from "./copy";
import { allowedEdits, notices } from "./allowed-edits";

const source = readFileSync(
  path.resolve(__dirname, "../../docs/research/volta-site/copy-verbatim.txt"),
  "utf8",
);
const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
const haystack = norm(source);

function leaves(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => leaves(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => leaves(v, out));
  return out;
}

const isUrl = (s: string) => /^https?:\/\//.test(s);

describe("copy", () => {
  it("every string is verbatim from volta.coffee or an allowed edit", () => {
    const allowed = new Set(allowedEdits.map(norm));
    const offenders = leaves(copy)
      .filter((s) => !isUrl(s))
      .filter((s) => !haystack.includes(norm(s)) && !allowed.has(norm(s)));
    expect(offenders).toEqual([]);
  });

  it("uses Winter 2026 for both Founders Edition dates", () => {
    expect(copy.hero.eyebrow).toBe("Founders Edition · Winter 2026");
    expect(copy.cta.eyebrow).toBe("Founders Edition · Winter 2026");
    expect(copy.cta.body).toContain("ready in the winter.");
  });

  it("never mentions fall", () => {
    const all = leaves(copy).join(" ");
    expect(all).not.toMatch(/Fall 2026|in the fall/);
  });

  it("notices are allowed edits", () => {
    for (const n of Object.values(notices)) expect(allowedEdits).toContain(n);
  });
});
