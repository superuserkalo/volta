import type { BatteryVariant, Highlight, SceneState, Vec3 } from "./scene-state";

/** What the camera looks at. Units: 1 = machine height; machine stands on y = 0, front faces +z at yaw 0. */
export interface Shot {
  focus: Vec3;
  /** Camera elevation above the focus, radians. */
  elev: number;
  fov: number;
  /** Radius around the focus that must stay on screen; the camera distance follows from it. */
  fit: number;
  /** Laptop placement: +1 right of the text column, 0 centered, -1 left. Phones always use the top half. */
  side: number;
}

type Flat = Omit<SceneState, "camera" | "focus" | "trayOpen"> & { shot: Shot };
type Patch = Partial<Omit<Flat, "shot">> & { shot?: Partial<Shot> };

const HERO_YAW = -0.8;

const base: Flat = {
  shot: { focus: [0, 0.48, 0], elev: 0.36, fov: 30, fit: 0.68, side: 1 },
  presence: 1,
  gate: false,
  machineYaw: HERO_YAW,
  paper: 0,
  blueprint: 0,
  xray: 0,
  callouts: 0,
  explode: 0,
  batteryAttach: 1,
  battery: "b-mount" as BatteryVariant,
  highlight: null as Highlight,
  boilerGlow: 0,
  panelLights: 1,
};

/** Each keyframe starts from the previous one, so only what changes is written. */
function build(steps: readonly [number, Patch][]) {
  const out: { at: number; state: Flat }[] = [];
  let prev = base;
  for (const [at, patch] of steps) {
    const state: Flat = { ...prev, ...patch, shot: { ...prev.shot, ...patch.shot } };
    out.push({ at, state });
    prev = state;
  }
  return out;
}

// Timing rule: a beat's copy is pinned for (length − 100vh) and the next
// beat's copy scrolls in during the last 100vh. Every move that could cross
// copy finishes before that point. Beat lengths live in beats.ts.
export const KEYFRAMES = build([
  // 0 · hero — their render's 3/4 view, right of the headline
  [0, {}],
  [0.9, { machineYaw: HERO_YAW - 0.1 }],

  // 1 · specs — centered blueprint with callouts (no copy beside it)
  [1.15, { shot: { elev: 0.22, fit: 0.95, side: 0 } }],
  [1.24, { paper: 1, blueprint: 1, xray: 0.65, machineYaw: -1.2 }],
  [1.38, { callouts: 1 }],
  [1.46, { callouts: 1, machineYaw: -1.3 }],
  [1.55, { callouts: 0 }],
  [1.76, { paper: 0, blueprint: 0, shot: { elev: 0.3, fit: 0.66, side: 1 } }],

  // 2 · pressure — x-ray, pump
  [2.0, {}],
  [2.25, { xray: 1, highlight: "pump", machineYaw: -1.25, shot: { focus: [0, 0.44, -0.1], fit: 0.62 } }],
  [2.9, { machineYaw: -1.1 }],

  // 3 · temperature — boiler glows
  [3.05, { highlight: "boiler", shot: { focus: [0, 0.6, 0.05], fit: 0.56 } }],
  [3.4, { boilerGlow: 1 }],
  [3.85, { machineYaw: -0.95 }],

  // 4 · control — solid again, close on the front panel, lights in order
  [4.15, { xray: 0, highlight: null, boilerGlow: 0, machineYaw: -0.35, shot: { focus: [0, 0.84, 0.42], elev: 0.32, fit: 0.32 } }],
  [4.25, { panelLights: 1 }],
  [4.6, { panelLights: 4 }],
  [4.75, { highlight: "modular-port", shot: { focus: [0, 0.94, 0.28], elev: 0.5, fit: 0.36 } }],
  [4.88, {}],

  // 5 · power — turn to the back, B-mount clicks on, then the adapters
  [5.26, { highlight: null, machineYaw: 2.45, batteryAttach: 0, shot: { focus: [0, 0.45, -0.3], elev: 0.15, fit: 0.64 } }],
  [5.36, { batteryAttach: 1 }],
  [5.4, {}],
  [5.48, { batteryAttach: 0 }],
  [5.49, { battery: "v-mount" }],
  [5.58, { batteryAttach: 1 }],
  [5.62, {}],
  [5.7, { batteryAttach: 0 }],
  [5.71, { battery: "a-mount" }],
  [5.8, { batteryAttach: 1 }],
  [5.82, {}],
  [5.9, { batteryAttach: 0 }],
  [5.91, { battery: "power-tool" }],
  [5.99, { batteryAttach: 1 }],

  // 6 · repair — blueprint again, the machine comes apart and goes back together
  [6.25, { machineYaw: -0.7, paper: 1, blueprint: 1, shot: { focus: [0, 0.55, 0], elev: 0.28, fit: 1.05 } }],
  [6.4, { explode: 1 }],
  [6.54, { explode: 1 }],
  [6.68, { explode: 0 }],
  [6.76, { paper: 0, blueprint: 0 }],

  // 7 · lab — front 3/4, door still closed
  [7.05, { machineYaw: -0.55, shot: { focus: [0, 0.45, 0.05], elev: 0.22, fit: 0.66 } }],
  [7.45, { machineYaw: -0.62 }],

  // 8 · quote — the gate: the door opens as a timed activation, then the machine leaves
  [8.0, { machineYaw: -0.6, shot: { focus: [0, 0.42, 0.12], elev: 0.2, fit: 0.72 } }],
  [8.3, { gate: true }],
  [8.62, { presence: 1 }],
  [8.88, { presence: 0 }],

  // 9 · final CTA — no machine
  [10, {}],
]);
