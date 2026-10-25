import { KEYFRAMES, type Shot } from "./keyframes";
import type { StoryPosition } from "./position";

export type Vec3 = readonly [number, number, number];
export type Framing = "landscape" | "portrait";
export type BatteryVariant = "none" | "b-mount" | "v-mount" | "a-mount" | "power-tool";

export type PartId =
  | "side-left"
  | "side-right"
  | "body"
  | "control-head"
  | "front-lid"
  | "top-deck"
  | "rear-lid"
  | "handle"
  | "handle-knob"
  | "front-door"
  | "cup-tray"
  | "drip-grate"
  | "cup-rest"
  | "b-mount"
  | "battery"
  | "dc-port"
  | "modular-port"
  | "reservoir"
  | "pump"
  | "boiler"
  | "basket"
  | "group"
  | "board";

export type Highlight = "pump" | "boiler" | "basket" | "modular-port" | "b-mount" | "dc-port" | null;

export interface SceneState {
  camera: { position: Vec3; target: Vec3; fov: number };
  /** The point the shot is about (machine space at yaw 0 = world, machine stands at the origin). */
  focus: Vec3;
  /** 0 machine hidden … 1 on stage. Used to hide side switches and to leave before the CTA. */
  presence: number;
  /** The front door is open (a timed activation at the quote; `trayOpen` follows it over time). */
  gate: boolean;
  /** Machine rotation about its vertical axis, radians. 0 = front faces the camera. */
  machineYaw: number;
  /** 0 dark stage … 1 blueprint paper background. */
  paper: number;
  /** 0 shaded … 1 hidden-line drawing. */
  blueprint: number;
  /** 0 solid shell … 1 ghosted shell with internals visible. */
  xray: number;
  /** Blueprint callout visibility. */
  callouts: number;
  explode: number;
  /** 0 front door closed … 1 folded down into the cup tray. sceneStateAt returns the target (gate ? 1 : 0); the stage animates it over time. */
  trayOpen: number;
  /** 0 battery pulled away from the back … 1 seated on the mount. */
  batteryAttach: number;
  battery: BatteryVariant;
  highlight: Highlight;
  boilerGlow: number;
  /** Indicators lit in order POWER, BREWING, BOILER, STEAM (0 … 4). */
  panelLights: number;
}

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** How a keyframe segment is eased. Default: a monotone curve through all keyframes (see below). */
export type Ease = "curve" | "linear" | "in" | "out" | "smooth";
const EASES: Record<Exclude<Ease, "curve">, (k: number) => number> = {
  linear: (k) => k,
  in: (k) => k * k * k,
  out: (k) => 1 - (1 - k) ** 3,
  smooth: (k) => k * k * (3 - 2 * k),
};

type Flat = Omit<SceneState, "camera" | "focus" | "trayOpen"> & { shot: Shot };

// Every number a keyframe can animate, read and written by index.
const CHANNELS: { get: (f: Flat) => number; set: (f: Flat, v: number) => void }[] = [
  ...[0, 1, 2].map((i) => ({
    get: (f: Flat) => f.shot.focus[i],
    set: (f: Flat, v: number) => {
      const xyz = [...f.shot.focus] as [number, number, number];
      xyz[i] = v;
      f.shot.focus = xyz;
    },
  })),
  ...(["elev", "fov", "fit", "side", "lift"] as const).map((k) => ({
    get: (f: Flat) => f.shot[k],
    set: (f: Flat, v: number) => void (f.shot[k] = v),
  })),
  ...(
    ["machineYaw", "paper", "blueprint", "xray", "callouts", "explode", "presence", "batteryAttach", "boilerGlow", "panelLights"] as const
  ).map((k) => ({
    get: (f: Flat) => f[k],
    set: (f: Flat, v: number) => void (f[k] = v),
  })),
];

/**
 * Tangents for a monotone cubic through each channel's keyframes (Fritsch–Butland).
 * Motion keeps its speed through a keyframe when the next segment continues in the
 * same direction, so chained moves glide instead of stopping at every keyframe.
 * Holds (equal neighbours) and turning points stay flat, and nothing overshoots.
 */
function tangents(times: readonly number[], values: readonly number[]): number[] {
  const n = times.length;
  const d = (i: number) => (values[i + 1] - values[i]) / (times[i + 1] - times[i]);
  return times.map((_, i) => {
    if (n < 2) return 0;
    // The very first keyframe starts moving at once (the page's first scroll should show motion).
    if (i === 0) return d(0);
    if (i === n - 1) return 0;
    const d0 = d(i - 1);
    const d1 = d(i);
    if (d0 * d1 <= 0) return 0;
    const h0 = times[i] - times[i - 1];
    const h1 = times[i + 1] - times[i];
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
  });
}

const TIMES = KEYFRAMES.map((f) => f.at);
const TANGENTS = CHANNELS.map((c) => tangents(TIMES, KEYFRAMES.map((f) => c.get(f.state))));

function hermite(v0: number, v1: number, m0: number, m1: number, h: number, k: number) {
  const k2 = k * k;
  const k3 = k2 * k;
  return (2 * k3 - 3 * k2 + 1) * v0 + (k3 - 2 * k2 + k) * h * m0 + (-2 * k3 + 3 * k2) * v1 + (k3 - k2) * h * m1;
}

function between(i: number, p: number): Flat {
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const h = b.at - a.at;
  const k = (p - a.at) / h;
  // Discrete fields switch when the next keyframe is reached.
  const out: Flat = { ...a.state, shot: { ...a.state.shot } };
  const ease = b.ease === "curve" ? null : EASES[b.ease];
  CHANNELS.forEach((c, j) => {
    const v0 = c.get(a.state);
    const v1 = c.get(b.state);
    c.set(out, ease ? mix(v0, v1, ease(k)) : hermite(v0, v1, TANGENTS[j][i], TANGENTS[j][i + 1], h, k));
  });
  return out;
}

/**
 * Frames a shot so the subject (a sphere of radius `fit` around `focus`)
 * sits inside the free part of the screen: the right or left half next to the
 * text column on a laptop (`side` +1 / -1, 0 = centered), the upper half above
 * the text panel on a phone. Distance follows from the fit, so nothing that
 * fits ever reaches the copy or leaves the viewport.
 */
function toCamera(shot: Shot, framing: Framing, aspect: number): SceneState["camera"] {
  const t = Math.tan((shot.fov * Math.PI) / 360);
  let zoneHalfX: number, zoneHalfY: number, cx: number, cy: number;
  if (framing === "portrait") {
    // top third of a phone, between the header and the text panel
    zoneHalfX = 0.9;
    zoneHalfY = 0.33;
    cx = 0;
    cy = 0.57;
  } else {
    const k = Math.min(1, Math.abs(shot.side));
    zoneHalfX = mix(0.9, 0.42, k);
    zoneHalfY = 0.8;
    cx = shot.side * 0.52;
    cy = 0;
  }
  // phones show close-ups a little wider so the subject never crowds the header or the copy
  const fit = framing === "portrait" ? Math.max(shot.fit, 0.55) : shot.fit;
  const halfH = Math.max(fit / (zoneHalfX * aspect), fit / zoneHalfY);
  const dist = halfH / t + fit * 0.6;
  const atFocus = t * dist; // half-height of the view at the subject
  const sx = cx * aspect * atFocus;
  // lift: the subject rides up the screen by this many viewport heights (leaves with the page)
  const sy = (cy + 2 * shot.lift) * atFocus;
  const target: Vec3 = [shot.focus[0] - sx, shot.focus[1] - sy, shot.focus[2]];
  const position: Vec3 = [target[0], target[1] + Math.sin(shot.elev) * dist, target[2] + Math.cos(shot.elev) * dist];
  return { position, target, fov: shot.fov };
}

/** `aspect` = viewport width / height; defaults to a typical laptop or phone for the framing. */
export function sceneStateAt(p: StoryPosition, framing: Framing, aspect = framing === "portrait" ? 390 / 844 : 1.6): SceneState {
  const last = KEYFRAMES.length - 1;
  let flat: Flat;
  if (p <= KEYFRAMES[0].at) flat = KEYFRAMES[0].state;
  else if (p >= KEYFRAMES[last].at) flat = KEYFRAMES[last].state;
  else {
    let i = 0;
    while (KEYFRAMES[i + 1].at <= p) i++;
    flat = between(i, p);
  }
  const { shot, ...rest } = flat;
  return { ...rest, focus: shot.focus, trayOpen: rest.gate ? 1 : 0, camera: toCamera(shot, framing, aspect) };
}
