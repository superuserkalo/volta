import { describe, expect, it } from "vitest";
import { ALLOWED_LABELS, PARTS } from "./parts";

describe("part registry", () => {
  it("has unique ids", () => {
    const ids = PARTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every part id", () => {
    const ids = new Set(PARTS.map((p) => p.id));
    for (const id of [
      "side-left", "side-right", "body", "control-head", "front-lid", "top-deck", "rear-lid", "handle", "handle-knob",
      "front-door", "cup-tray", "drip-grate", "cup-rest", "b-mount", "battery", "dc-port", "modular-port",
      "reservoir", "pump", "boiler", "basket", "group", "board",
    ]) {
      expect(ids.has(id as never), id).toBe(true);
    }
  });

  it("every part except the body moves when exploded", () => {
    for (const p of PARTS) {
      const len = Math.hypot(...p.explode);
      if (p.id === "body") expect(len).toBe(0);
      else expect(len, p.id).toBeGreaterThan(0);
    }
  });

  it("labels only use words from VOLTA's copy", () => {
    for (const p of PARTS) if (p.label) expect(ALLOWED_LABELS).toContain(p.label);
  });

  it("models no steam wand", () => {
    for (const p of PARTS) {
      expect(p.id).not.toMatch(/wand|steam/);
      expect(p.label ?? "").not.toMatch(/wand|steam/i);
    }
  });
});
