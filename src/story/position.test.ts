import { describe, expect, it } from "vitest";
import { beatAt, damp, positionFromScroll, scrollFromPosition } from "./position";

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
  it("a whole-pixel scroll just short of a fractional section top lands on that section", () => {
    expect(positionFromScroll(300, [0, 100, 300.19], heights)).toBe(2);
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

describe("scrollFromPosition", () => {
  const tops = [0, 100, 300];
  const heights = [100, 200, 50];
  it("inverts positionFromScroll", () => {
    for (const y of [0, 37, 100, 250, 310]) {
      expect(scrollFromPosition(positionFromScroll(y, tops, heights), tops, heights)).toBeCloseTo(y, 6);
    }
  });
  it("clamps out-of-range positions", () => {
    expect(scrollFromPosition(-2, tops, heights)).toBe(0);
    expect(scrollFromPosition(7, tops, heights)).toBe(350);
  });
});
