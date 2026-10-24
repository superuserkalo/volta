import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CURVES, ROASTS, drawAmount, xForTemp } from "./chart-data";

const svg = (name: string) => readFileSync(path.resolve(__dirname, `../../../docs/research/volta-site/${name}`), "utf8");

describe("chart data matches volta.coffee", () => {
  it("pressure curves are VOLTA's exact paths", () => {
    const paths = [...svg("chart-pressure.svg").matchAll(/<path d="([^"]+)"[^>]*stroke="(#[0-9A-F]+)"/g)].map((m) => [m[1], m[2]]);
    expect(CURVES.map((c) => [c.d, c.stroke.toUpperCase()])).toEqual(
      expect.arrayContaining(paths.map(([d, s]) => [d, s.toUpperCase()])),
    );
    expect(CURVES).toHaveLength(paths.length);
  });

  it("roast setpoints sit where VOLTA draws them", () => {
    const cx = [...svg("chart-temperature.svg").matchAll(/<circle cx="(\d+)"/g)].map((m) => +m[1]);
    expect(ROASTS.map((r) => r.value)).toEqual([88, 92, 96]);
    ROASTS.forEach((r, i) => expect(Math.abs(xForTemp(r.value) - cx[i])).toBeLessThan(1));
  });
});

describe("drawAmount", () => {
  it("runs 0 → 1 monotonically for each curve", () => {
    for (let i = 0; i < 3; i++) {
      expect(drawAmount(0, i)).toBe(0);
      expect(drawAmount(1, i)).toBe(1);
      let prev = 0;
      for (let t = 0; t <= 1; t += 0.01) {
        const v = drawAmount(t, i);
        expect(v).toBeGreaterThanOrEqual(prev);
        prev = v;
      }
    }
  });
});
