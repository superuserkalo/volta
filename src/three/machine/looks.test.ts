import { describe, expect, it } from "vitest";
import { lookFor, type ModeState } from "./looks";

const base: ModeState = { blueprint: 0, xray: 0, explode: 0, highlight: null, boilerGlow: 0, panelLights: 0 };

describe("lookFor", () => {
  it("shaded: exterior opaque, no edges, internals hidden", () => {
    const ext = lookFor("alu", "exterior", "body", base);
    expect(ext.opacity).toBe(1);
    expect(ext.edgeOpacity).toBe(0);
    expect(lookFor("steel", "internal", "pump", base).visible).toBe(false);
  });

  it("blueprint: paper fills with full ink edges", () => {
    const l = lookFor("alu", "exterior", "body", { ...base, blueprint: 1 });
    expect(l.edgeOpacity).toBe(1);
    expect(l.color).toBe("#f3f1ee");
    expect(l.metalness).toBe(0);
  });

  it("x-ray: shell ghosted, internals solid", () => {
    const s = { ...base, xray: 1 };
    expect(lookFor("alu", "exterior", "body", s).opacity).toBeLessThanOrEqual(0.15);
    const pump = lookFor("steel", "internal", "pump", s);
    expect(pump.visible).toBe(true);
    expect(pump.opacity).toBe(1);
  });

  it("explode shows internals", () => {
    expect(lookFor("steel", "internal", "boiler", { ...base, explode: 0.5 }).visible).toBe(true);
  });

  it("highlights only the named part, boiler glows with boilerGlow", () => {
    const s = { ...base, xray: 1, highlight: "boiler" as const, boilerGlow: 1 };
    expect(lookFor("steel", "internal", "boiler", s).emissiveIntensity).toBeGreaterThan(0);
    expect(lookFor("steel", "internal", "pump", s).emissiveIntensity).toBe(0);
  });

  it("panel lights come on in order", () => {
    const s = { ...base, panelLights: 2 };
    expect(lookFor("led-0", "exterior", "control-head", s).emissiveIntensity).toBeGreaterThan(0);
    expect(lookFor("led-1", "exterior", "control-head", s).emissiveIntensity).toBeGreaterThan(0);
    expect(lookFor("led-2", "exterior", "control-head", s).emissiveIntensity).toBe(0);
    expect(lookFor("led-3", "exterior", "control-head", s).emissiveIntensity).toBe(0);
  });
});
