import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { BEATS } from "./beats";
import { POWER_HOLDS } from "./keyframes";
import { sceneStateAt, type Framing, type SceneState } from "./scene-state";

// trayOpen is not here: the door is a timed activation (see `gate`), not scrubbed.
const numeric = (s: SceneState) => ({
  machineYaw: s.machineYaw,
  paper: s.paper,
  blueprint: s.blueprint,
  xray: s.xray,
  callouts: s.callouts,
  explode: s.explode,
  batteryAttach: s.batteryAttach,
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
    const s = at(1.42);
    expect(s.paper).toBeCloseTo(1);
    expect(s.blueprint).toBeCloseTo(1);
    expect(s.callouts).toBeCloseTo(1);
  });
  it("paper is gone before the pressure copy (light text) scrolls in", () => {
    expect(at(1.76).paper).toBeCloseTo(0);
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
  it("control: all four panel lights", () => {
    expect(at(4.7).panelLights).toBeCloseTo(4);
    expect(at(4.8).highlight).toBe("modular-port");
  });
  it("control → power: the battery stays seated while the machine turns to its back", () => {
    for (let p = 4.84; p <= 5.31; p += 0.01) {
      expect(at(p).batteryAttach, `p=${p.toFixed(2)}`).toBeCloseTo(1);
      expect(at(p).battery).toBe("b-mount");
    }
  });
  it("power: each pack is seated and held at its stop, in order, while the copy is pinned", () => {
    const order = ["b-mount", "v-mount", "a-mount", "power-tool"];
    POWER_HOLDS.forEach((stop, i) => {
      // pinned power copy: until 100vh before the end of the 500vh beat
      expect(stop).toBeLessThan(5.8);
      for (const d of [-0.02, 0, 0.02]) {
        expect(at(stop + d).battery).toBe(order[i]);
        expect(at(stop + d).batteryAttach).toBeCloseTo(1);
      }
    });
  });
  it("repair: explodes, reassembles, and leaves the paper before the lab copy", () => {
    expect(at(6.45).explode).toBeGreaterThanOrEqual(0.95);
    expect(at(6.72).explode).toBeCloseTo(0);
    expect(at(6.8).paper).toBeCloseTo(0);
  });
  it("quote: the door is a gate that opens at the activation point", () => {
    expect(at(7.7).gate).toBe(false);
    expect(at(8.25).gate).toBe(false);
    expect(at(8.32).gate).toBe(true);
    expect(at(8.5).gate).toBe(true);
    expect(at(8.5).trayOpen).toBe(1);
  });
  it("the machine rides up and out with the quote and stays gone for the CTA", () => {
    expect(at(8.4).presence).toBe(1);
    // the quote copy scrolls out over 8.6 … 9.0 (100vh); the machine rises at the same rate
    for (const p of [8.7, 8.8, 8.9]) {
      expect(at(p).camera.target[1]).toBeLessThan(at(p - 0.05).camera.target[1]);
    }
    expect(at(8.8).presence).toBe(1);
    expect(at(9.0).presence).toBeCloseTo(0);
    expect(at(9.5).presence).toBeCloseTo(0);
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
      [0, 0.6], [1.75, 2.5], [2.5, 3.5], [3.5, 4.5], [4.5, 5.8], [5.8, 6.75], [6.75, 7.5], [7.5, 8.6],
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
      const s = sceneStateAt(6.45, framing, aspect);
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
