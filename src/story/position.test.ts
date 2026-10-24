import { describe, expect, it } from "vitest";
import { beatAt, damp, positionFromScroll } from "./position";

describe("beatAt", () => {
  it("maps story positions to beats", () => {
    expect(beatAt(0)).toEqual({ id: "hero", t: 0 });
    expect(beatAt(5.5)).toEqual({ id: "power", t: 0.5 });
    expect(beatAt(99)).toEqual({ id: "cta", t: 1 });
    expect(beatAt(-1)).toEqual({ id: "hero", t: 0 });
  });
});

describe("positionFromScroll", () => {
  const tops = [0, 100, 300];
  const heights = [100, 200, 50];
  it("is the beat index plus progress through that beat", () => {
    expect(positionFromScroll(0, tops, heights)).toBe(0);
    expect(positionFromScroll(50, tops, heights)).toBe(0.5);
    expect(positionFromScroll(200, tops, heights)).toBe(1.5);
    expect(positionFromScroll(325, tops, heights)).toBe(2.5);
  });
  it("clamps before the first and after the last beat", () => {
    expect(positionFromScroll(-40, tops, heights)).toBe(0);
    expect(positionFromScroll(9999, tops, heights)).toBe(3);
  });
});

describe("damp", () => {
  it("moves toward the target without overshooting", () => {
    const v = damp(0, 1, 8, 1 / 60);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThan(1);
    expect(damp(0, 1, 8, 10)).toBeCloseTo(1, 6);
  });
  it("is frame-rate independent", () => {
    const one = damp(0, 1, 8, 1 / 30);
    const two = damp(damp(0, 1, 8, 1 / 60), 1, 8, 1 / 60);
    expect(one).toBeCloseTo(two, 6);
  });
});
