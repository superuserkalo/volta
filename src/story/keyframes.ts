import { storyAt, type BeatId } from "./beats";
import type { BatteryVariant, Ease, Highlight, SceneState, Vec3 } from "./scene-state";

/** What the camera looks at. Units: 1 = machine height; machine stands on y = 0, front faces +z at yaw 0. */
export interface Shot {
  focus: Vec3;
  /** Camera elevation above the focus, radians. */
  elev: number;
  fov: number;
  /** Radius around the focus that must stay on screen; the camera distance follows from it. */
  fit: number;
  /** Laptop placement: +1 right of the text column, 0 centered, -1 left (a little past 1 pushes further out). Phones always use the top half. */
  side: number;
  /** Viewport heights the subject has risen up the screen, so it can leave with the page. */
  lift: number;
}

type Flat = Omit<SceneState, "camera" | "focus" | "trayOpen"> & { shot: Shot };
type Patch = Partial<Omit<Flat, "shot">> & { shot?: Partial<Shot> };

const HERO_YAW = -0.8;

const base: Flat = {
  shot: { focus: [0, 0.48, 0], elev: 0.36, fov: 30, fit: 0.68, side: 1, lift: 0 },
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

type Step = [BeatId, number, Patch] | [BeatId, number, Patch, Ease];

/**
 * Each keyframe starts from the previous one, so only what changes is written.
 * Keyframes are placed at [beat, vh into that beat]; `ease` shapes the segment that ends at it.
 */
function build(steps: readonly Step[]) {
  const out: { at: number; state: Flat; ease: Ease }[] = [];
  let prev = base;
  for (const [beat, vh, patch, ease = "curve"] of steps) {
    const state: Flat = { ...prev, ...patch, shot: { ...prev.shot, ...patch.shot } };
    out.push({ at: storyAt(beat, vh), state, ease });
    prev = state;
  }
  return out;
}

/** Where each pack takes over from the one before: V-mount, A-mount, power-tool. The swap itself plays over time. */
const SWAPS_VH = [145, 200, 255] as const;
/** Middle of each pack's stretch on screen, in order B-mount, V-mount, A-mount, power-tool. */
export const POWER_HOLDS = [115, 172, 228, 280].map((vh) => storyAt("power", vh));

// Timing rules (vh = scroll distance, so a move takes the same scroll in every beat):
// - A beat's copy is pinned for (length − 100vh); the next beat's copy scrolls in over the last 100vh.
// - Camera moves take 50–90vh and glide through chained keyframes; a repeated value is a hold.
// - paper / blueprint / callouts / battery switch at a point and then play over a fixed time
//   (see Scene's Rig), so stopping the scroll never leaves them half done.
export const KEYFRAMES = build([
  // hero — their render's 3/4 view, right of the headline; it starts turning on the first scroll
  ["hero", 0, {}],
  ["hero", 70, { machineYaw: -1.05, shot: { elev: 0.3 } }],

  // specs — centered blueprint with callouts; the spec row sits along the bottom
  ["specs", 20, { machineYaw: -1.15, shot: { elev: 0.22, fit: 0.95, side: 0 } }],
  ["specs", 30, { paper: 1, blueprint: 1 }],
  ["specs", 55, { xray: 0.65, machineYaw: -1.2, callouts: 1 }],
  ["specs", 110, { machineYaw: -1.3 }],
  ["specs", 115, { callouts: 0 }],
  // dark again just as the pressure copy (light text) starts to come in, then back beside the copy
  ["specs", 150, { paper: 0, blueprint: 0 }],
  ["specs", 205, { shot: { elev: 0.3, fit: 0.66, side: 1 } }],

  // pressure — x-ray, pump
  ["pressure", 0, {}],
  ["pressure", 50, { xray: 1, highlight: "pump", machineYaw: -1.25, shot: { focus: [0, 0.44, -0.1], fit: 0.62 } }],
  ["pressure", 180, { machineYaw: -1.1 }],

  // temperature — boiler glows
  ["temperature", 10, { highlight: "boiler", shot: { focus: [0, 0.6, 0.05], fit: 0.56 } }],
  ["temperature", 80, { boilerGlow: 1 }],
  ["temperature", 170, { machineYaw: -0.95 }],

  // control — solid again, close on the front panel (well right of the copy), lights in order
  ["control", 30, { xray: 0, highlight: null, boilerGlow: 0, machineYaw: -0.4, shot: { focus: [0, 0.84, 0.42], elev: 0.3, fit: 0.36, side: 1.3 } }],
  ["control", 40, {}],
  ["control", 95, { panelLights: 4 }],
  ["control", 125, { highlight: "modular-port", shot: { focus: [0, 0.92, 0.3], elev: 0.48, fit: 0.38 } }],
  ["control", 145, { highlight: null }],
  ["control", 180, {}],

  // power — pull back and turn to the back in one move, battery seated the whole way
  ["power", 30, { machineYaw: 1.0, shot: { focus: [0, 0.5, -0.05], elev: 0.28, fit: 0.74, side: 1 } }],
  ["power", 85, { machineYaw: 2.45, shot: { focus: [0, 0.45, -0.3], elev: 0.15, fit: 0.64 } }],
  // each pack has ~55vh on screen; crossing into the next one plays the swap
  ["power", SWAPS_VH[0], { battery: "v-mount" }],
  ["power", SWAPS_VH[1], { battery: "a-mount" }],
  ["power", SWAPS_VH[2], { battery: "power-tool" }],
  ["power", 310, { machineYaw: 2.6 }],
  // paper comes on as the repair copy (dark ink) comes in
  ["power", 335, { paper: 1, blueprint: 1 }],

  // repair — the machine turns to the front, comes apart and goes back together
  ["repair", 40, { machineYaw: -0.7, shot: { focus: [0, 0.55, 0], elev: 0.28, fit: 1.05 } }],
  ["repair", 95, { explode: 1 }],
  ["repair", 130, { explode: 1 }],
  ["repair", 180, { explode: 0 }],
  ["repair", 215, { paper: 0, blueprint: 0 }],

  // lab — front 3/4, door still closed
  ["lab", 10, { machineYaw: -0.55, shot: { focus: [0, 0.45, 0.05], elev: 0.22, fit: 0.66 } }],
  ["lab", 70, { machineYaw: -0.62 }],

  // quote — the door opens as a timed activation; then the machine rides up
  // and off the screen with the quote (same speed as the page) and fades as it goes
  ["quote", 0, { machineYaw: -0.6, shot: { focus: [0, 0.42, 0.12], elev: 0.2, fit: 0.72 } }],
  ["quote", 45, { gate: true }],
  ["quote", 120, {}],
  ["quote", 170, { shot: { lift: 0.5 } }, "linear"],
  ["quote", 220, { presence: 0, shot: { lift: 1 } }, "linear"],

  // final CTA — no machine
  ["cta", 100, {}],
]);
