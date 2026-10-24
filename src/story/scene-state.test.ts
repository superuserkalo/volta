import { describe, expect, it } from "vitest";
import { BEATS } from "./beats";
import { sceneStateAt, type Framing, type SceneState } from "./scene-state";

const numeric = (s: SceneState) => ({
  machineYaw: s.machineYaw,
  paper: s.paper,
  blueprint: s.blueprint,
  xray: s.xray,
  callouts: s.callouts,
  explode: s.explode,
  trayOpen: s.trayOpen,
  batteryAttach: s.batteryAttach,
  boilerGlow: s.boilerGlow,
  panelLights: s.panelLights / 4,
});

describe("sceneStateAt", () => {
  const at = (p: number) => sceneStateAt(p, "landscape");

  it("hero: shaded, tray closed, battery seated", () => {
    const s = at(0.2);
    expect(s.paper).toBe(0);
    expect(s.blueprint).toBe(0);
    expect(s.trayOpen).toBe(0);
    expect(s.battery).toBe("b-mount");
  });
  it("specs: blueprint with callouts", () => {
    const s = at(1.5);
    expect(s.paper).toBeCloseTo(1);
    expect(s.blueprint).toBeCloseTo(1);
    expect(s.callouts).toBeCloseTo(1);
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
    expect(at(4.75).panelLights).toBeCloseTo(4);
    expect(at(4.92).highlight).toBe("modular-port");
  });
  it("power: battery variants in order", () => {
    expect(at(5.3).battery).toBe("b-mount");
    expect(at(5.55).battery).toBe("v-mount");
    expect(at(5.75).battery).toBe("a-mount");
    expect(at(5.92).battery).toBe("power-tool");
  });
  it("repair: explodes then reassembles", () => {
    expect(at(6.45).explode).toBeGreaterThanOrEqual(0.9);
    expect(at(7.0).explode).toBeCloseTo(0);
    expect(at(7.0).paper).toBeCloseTo(0);
  });
  it("lab: tray folds open and stays open", () => {
    expect(at(7.1).trayOpen).toBeCloseTo(0);
    expect(at(7.7).trayOpen).toBeCloseTo(1);
    expect(at(9.5).trayOpen).toBeCloseTo(1);
  });

  it.each<Framing>(["landscape", "portrait"])("never jumps (%s)", (framing) => {
    let prev = sceneStateAt(0, framing);
    for (let p = 0.005; p <= BEATS.length; p += 0.005) {
      const s = sceneStateAt(p, framing);
      const a = numeric(prev);
      const b = numeric(s);
      for (const k of Object.keys(a) as (keyof typeof a)[]) {
        expect(Math.abs(b[k] - a[k]), `${k} at p=${p.toFixed(3)}`).toBeLessThan(0.12);
      }
      // camera moves less than ~1.5% of its distance per step (no cuts)
      const dc = Math.hypot(...s.camera.position.map((v, i) => v - prev.camera.position[i]));
      const dist = Math.hypot(...s.camera.position.map((v, i) => v - s.camera.target[i]));
      expect(dc / dist, `camera at p=${p.toFixed(3)}`).toBeLessThan(0.015);
      prev = s;
    }
  });

  it("only highlights parts that VOLTA's copy names", () => {
    const allowed = new Set(["pump", "boiler", "basket", "modular-port", "b-mount", "dc-port", null]);
    for (let p = 0; p <= BEATS.length; p += 0.01) {
      expect(allowed.has(sceneStateAt(p, "landscape").highlight)).toBe(true);
    }
  });
});
