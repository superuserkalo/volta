import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { BEATS, storyAt } from "./beats";
import { POWER_HOLDS } from "./keyframes";
import { sceneStateAt, type Framing, type SceneState } from "./scene-state";

// Scrubbed values only. Not here: trayOpen, paper, blueprint, callouts and batteryAttach are
// switched at a point and played over time by the stage.
const numeric = (s: SceneState) => ({
  machineYaw: s.machineYaw,
  xray: s.xray,
  explode: s.explode,
  boilerGlow: s.boilerGlow,
  panelLights: s.panelLights / 4,
  presence: s.presence,
});

/** Where a world point lands on screen, in NDC (-1 … 1). */
function ndc(s: SceneState, point: readonly [number, number, number], aspect: number) {
  const cam = new THREE.PerspectiveCamera(s.camera.fov, aspect, 0.05, 50);
  cam.position.set(...s.camera.position);
  cam.lookAt(new THREE.Vector3(...s.camera.target));
  cam.updateMatrixWorld();
  return new THREE.Vector3(...point).project(cam);
}

describe("sceneStateAt", () => {
  const at = (p: number) => sceneStateAt(p, "landscape");

  it("hero: shaded, door closed, battery seated", () => {
    const s = at(0.2);
    expect(s.paper).toBe(0);
    expect(s.blueprint).toBe(0);
    expect(s.gate).toBe(false);
    expect(s.battery).toBe("b-mount");
  });
  it("specs: blueprint with callouts", () => {
    const s = at(storyAt("specs", 80));
    expect(s.paper).toBe(1);
    expect(s.blueprint).toBe(1);
    expect(s.callouts).toBe(1);
  });
  it("paper is gone before the pressure copy (light text) shows", () => {
    expect(at(storyAt("specs", 160)).paper).toBe(0);
  });
  it("paper, blueprint and callouts are switches, never a half-way look", () => {
    for (let p = 0; p <= BEATS.length; p += 0.005) {
      const s = at(p);
      for (const v of [s.paper, s.blueprint, s.callouts]) expect([0, 1]).toContain(v);
      expect(s.batteryAttach).toBe(1);
    }
  });
  it("pressure: x-ray on the pump", () => {
    const s = at(2.5);
    expect(s.xray).toBeCloseTo(1);
    expect(s.highlight).toBe("pump");
  });
  it("temperature: boiler glows", () => {
    const s = at(3.6);
    expect(s.highlight).toBe("boiler");
    expect(s.boilerGlow).toBeCloseTo(1);
  });
  it("control: all four panel lights, while the control copy is pinned", () => {
    expect(at(storyAt("control", 100)).panelLights).toBeCloseTo(4);
    expect(at(storyAt("control", 130)).highlight).toBe("modular-port");
    expect(at(storyAt("control", 150)).highlight).toBe(null);
  });
  it("control → power: the B-mount stays on while the machine turns to its back", () => {
    for (let p = storyAt("control", 150); p <= POWER_HOLDS[0]; p += 0.01) {
      expect(at(p).battery, `p=${p.toFixed(2)}`).toBe("b-mount");
    }
    expect(at(POWER_HOLDS[0]).machineYaw).toBeCloseTo(2.45);
  });
  it("power: each pack has its own stretch, in order, while the copy is pinned", () => {
    const order = ["b-mount", "v-mount", "a-mount", "power-tool"];
    const pinnedUntil = storyAt("power", BEATS.find((b) => b.id === "power")!.lengthVh - 100);
    POWER_HOLDS.forEach((mid, i) => {
      expect(mid).toBeLessThan(pinnedUntil);
      for (const dvh of [-25, 0, 25]) expect(at(mid + dvh / 400).battery).toBe(order[i]);
    });
  });
  it("repair: blueprint, explodes, reassembles, and leaves the paper before the lab copy", () => {
    expect(at(storyAt("repair", 0)).paper).toBe(1);
    expect(at(storyAt("repair", 110)).explode).toBeGreaterThanOrEqual(0.95);
    expect(at(storyAt("repair", 185)).explode).toBeCloseTo(0);
    expect(at(storyAt("repair", 220)).paper).toBe(0);
  });
  it("quote: the door is a gate that opens at the activation point", () => {
    expect(at(storyAt("lab", 150)).gate).toBe(false);
    expect(at(storyAt("quote", 40)).gate).toBe(false);
    expect(at(storyAt("quote", 50)).gate).toBe(true);
    expect(at(storyAt("quote", 100)).gate).toBe(true);
    expect(at(storyAt("quote", 100)).trayOpen).toBe(1);
  });
  it("the machine rides up and out with the quote and stays gone for the CTA", () => {
    const q = (vh: number) => storyAt("quote", vh);
    expect(at(q(110)).presence).toBe(1);
    // the quote copy scrolls out over its last 100vh; the machine rises at the same rate
    for (const vh of [140, 170, 200]) {
      expect(at(q(vh)).camera.target[1]).toBeLessThan(at(q(vh - 10)).camera.target[1]);
    }
    expect(at(q(170)).presence).toBe(1);
    expect(at(q(220)).presence).toBeCloseTo(0);
    expect(at(storyAt("cta", 50)).presence).toBeCloseTo(0);
  });
  it("beats are sized to what happens in them", () => {
    // no beat leaves the copy pinned for more than 3 screens, and nothing is shorter than a screen
    for (const b of BEATS) {
      expect(b.lengthVh - 100, b.id).toBeLessThanOrEqual(300);
      expect(b.lengthVh, b.id).toBeGreaterThanOrEqual(100);
    }
  });
  it("starts moving on the very first scroll", () => {
    expect(Math.abs(at(0.02).machineYaw - at(0).machineYaw)).toBeGreaterThan(0.005);
  });

  it.each<Framing>(["landscape", "portrait"])("never jumps while visible (%s)", (framing) => {
    // one step = 1vh of scroll (beats differ in length, so the step size in story units does too)
    const stepAt = (p: number) => 1 / BEATS[Math.min(BEATS.length - 1, Math.floor(p))].lengthVh;
    let prev = sceneStateAt(0, framing);
    for (let p = stepAt(0); p <= BEATS.length; p += stepAt(p)) {
      const s = sceneStateAt(p, framing);
      const a = numeric(prev);
      const b = numeric(s);
      for (const k of Object.keys(a) as (keyof typeof a)[]) {
        expect(Math.abs(b[k] - a[k]), `${k} at p=${p.toFixed(3)}`).toBeLessThan(0.12);
      }
      // camera moves less than ~1.8% of its distance per step (no cuts), unless the machine is hidden
      if (s.presence > 0.05 && prev.presence > 0.05) {
        const dc = Math.hypot(...s.camera.position.map((v, i) => v - prev.camera.position[i]));
        const dist = Math.hypot(...s.camera.position.map((v, i) => v - s.camera.target[i]));
        expect(dc / dist, `camera at p=${p.toFixed(3)}`).toBeLessThan(0.018);
      }
      prev = s;
    }
  });

  it("on a laptop the machine stays right of the text column while copy is on the left", () => {
    // beats whose copy sits in the left column, sampled while that copy is on screen
    const leftCopy: [number, number][] = [
      [0, storyAt("hero", 60)],
      [storyAt("specs", 205), storyAt("quote", 120)],
    ];
    for (const [a, b] of leftCopy) {
      for (let p = a; p <= b; p += 0.02) {
        const s = sceneStateAt(p, "landscape", 1.6);
        const x = ndc(s, s.focus, 1.6).x;
        expect(x, `focus x at p=${p.toFixed(2)}`).toBeGreaterThan(0.12);
      }
    }
  });

  it("the exploded machine fits on screen", () => {
    for (const [framing, aspect] of [["landscape", 1.6], ["portrait", 390 / 844]] as const) {
      const s = sceneStateAt(storyAt("repair", 110), framing, aspect);
      for (const corner of [[-0.95, 0, 0], [0.95, 0, 0], [0, 1.5, 0], [0, -0.1, 0]] as const) {
        const p = ndc(s, [s.focus[0] + corner[0], s.focus[1] + corner[1] - 0.5, s.focus[2] + corner[2]], aspect);
        expect(Math.abs(p.x), `${framing} x`).toBeLessThanOrEqual(1);
        expect(Math.abs(p.y), `${framing} y`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("only highlights parts that VOLTA's copy names", () => {
    const allowed = new Set(["pump", "boiler", "basket", "modular-port", "b-mount", "dc-port", null]);
    for (let p = 0; p <= BEATS.length; p += 0.01) {
      expect(allowed.has(sceneStateAt(p, "landscape").highlight)).toBe(true);
    }
  });
});
