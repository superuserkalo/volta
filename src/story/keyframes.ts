import type { BatteryVariant, Highlight, SceneState, Vec3 } from "./scene-state";

/** What the camera looks at. Units: 1 = machine height; machine stands on y = 0, front faces +z at yaw 0. */
export interface Shot {
  focus: Vec3;
  dist: number;
  /** Camera elevation above the focus, radians. */
  elev: number;
  fov: number;
  /** Landscape screen offset of the subject, in half-heights (x → right, y → up). */
  screen: readonly [number, number];
  /** Half-width of what must stay on screen; portrait pulls the camera back until it fits. */
  fit: number;
}

type Flat = Omit<SceneState, "camera"> & { shot: Shot };
type Patch = Partial<Omit<Flat, "shot">> & { shot?: Partial<Shot> };

const HERO_YAW = -0.8;

const base: Flat = {
  shot: { focus: [0, 0.48, 0], dist: 3.7, elev: 0.36, fov: 30, screen: [0.5, 0], fit: 0.62 },
  machineYaw: HERO_YAW,
  paper: 0,
  blueprint: 0,
  xray: 0,
  callouts: 0,
  explode: 0,
  trayOpen: 0,
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

export const KEYFRAMES = build([
  // 0 · hero — their render's 3/4 view
  [0, {}],
  [0.7, { machineYaw: HERO_YAW - 0.1 }],

  // 1 · specs — blueprint, side elevation, callouts
  [1.0, { shot: { dist: 3.4, elev: 0.2, screen: [0.12, 0.2], fit: 0.95 } }],
  [1.12, { paper: 1, blueprint: 1, xray: 0.65, machineYaw: -1.2 }],
  [1.4, { callouts: 1 }],
  [1.75, { callouts: 1, machineYaw: -1.35 }],
  [1.88, { callouts: 0 }],
  [2.0, { paper: 0, blueprint: 0 }],

  // 2 · pressure — x-ray, pump
  [2.28, { xray: 1, highlight: "pump", machineYaw: -1.25, shot: { focus: [0, 0.42, -0.1], dist: 3.0, screen: [0.5, 0], fit: 0.6 } }],
  [2.9, { machineYaw: -1.1 }],

  // 3 · temperature — boiler glows
  [3.05, { highlight: "boiler", shot: { focus: [0, 0.6, 0.05], dist: 2.9 } }],
  [3.5, { boilerGlow: 1 }],
  [3.85, { machineYaw: -0.95 }],

  // 4 · control — solid again, front panel close-up, lights in order
  [4.2, { xray: 0, highlight: null, boilerGlow: 0, machineYaw: -0.35, shot: { focus: [0, 0.82, 0.45], dist: 1.9, elev: 0.32, fit: 0.32 } }],
  [4.25, { panelLights: 1 }],
  [4.7, { panelLights: 4 }],
  [4.85, { highlight: "modular-port", shot: { focus: [0, 0.95, 0.25], dist: 2.1, elev: 0.5 } }],
  [4.9, {}],

  // 5 · power — turn to the back, B-mount clicks on, then the adapters
  [5.26, { highlight: null, machineYaw: 2.45, batteryAttach: 0, shot: { focus: [0, 0.45, -0.3], dist: 3.0, elev: 0.15, fit: 0.62 } }],
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

  // 6 · repair — blueprint again, the machine comes apart
  [6.33, { machineYaw: -0.7, paper: 1, blueprint: 1, shot: { focus: [0, 0.5, 0], dist: 4.3, elev: 0.28, fit: 1.15 } }],
  [6.47, { explode: 1 }],
  [6.7, { explode: 1 }],
  [6.88, { explode: 0 }],
  [7.0, { paper: 0, blueprint: 0 }],

  // 7 · lab — the cup tray folds down
  [7.25, { trayOpen: 0, machineYaw: -0.55, shot: { focus: [0, 0.4, 0.1], dist: 3.4, elev: 0.15, fit: 0.7 } }],
  [7.6, { trayOpen: 1 }],
  [7.95, { machineYaw: -0.7 }],

  // 8 · quote — calm, pulled back
  [8.5, { shot: { focus: [0, 0.5, 0], dist: 4.4, screen: [0.75, 0] } }],

  // 9 · final CTA — back to the hero angle, tray open
  [9.3, { machineYaw: HERO_YAW, shot: { dist: 4.2, elev: 0.25, screen: [0, -0.55] } }],
  [10, {}],
]);
