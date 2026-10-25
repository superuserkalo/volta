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

const smoothstep = (k: number) => k * k * (3 - 2 * k);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: Vec3, b: Vec3, k: number): Vec3 => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];

type Flat = Omit<SceneState, "camera" | "focus" | "trayOpen"> & { shot: Shot };

function mixFlat(a: Flat, b: Flat, k: number): Flat {
  return {
    shot: {
      focus: mix3(a.shot.focus, b.shot.focus, k),
      elev: mix(a.shot.elev, b.shot.elev, k),
      fov: mix(a.shot.fov, b.shot.fov, k),
      fit: mix(a.shot.fit, b.shot.fit, k),
      side: mix(a.shot.side, b.shot.side, k),
    },
    machineYaw: mix(a.machineYaw, b.machineYaw, k),
    paper: mix(a.paper, b.paper, k),
    blueprint: mix(a.blueprint, b.blueprint, k),
    xray: mix(a.xray, b.xray, k),
    callouts: mix(a.callouts, b.callouts, k),
    explode: mix(a.explode, b.explode, k),
    presence: mix(a.presence, b.presence, k),
    batteryAttach: mix(a.batteryAttach, b.batteryAttach, k),
    boilerGlow: mix(a.boilerGlow, b.boilerGlow, k),
    panelLights: mix(a.panelLights, b.panelLights, k),
    // Discrete fields switch when the next keyframe is reached.
    battery: a.battery,
    highlight: a.highlight,
    gate: a.gate,
  };
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
  const sy = cy * atFocus;
  const target: Vec3 = [shot.focus[0] - sx, shot.focus[1] - sy, shot.focus[2]];
  const position: Vec3 = [target[0], target[1] + Math.sin(shot.elev) * dist, target[2] + Math.cos(shot.elev) * dist];
  return { position, target, fov: shot.fov };
}

/** `aspect` = viewport width / height; defaults to a typical laptop or phone for the framing. */
export function sceneStateAt(p: StoryPosition, framing: Framing, aspect = framing === "portrait" ? 390 / 844 : 1.6): SceneState {
  const frames = KEYFRAMES;
  let flat: Flat;
  if (p <= frames[0].at) flat = frames[0].state;
  else if (p >= frames[frames.length - 1].at) flat = frames[frames.length - 1].state;
  else {
    let i = 0;
    while (frames[i + 1].at <= p) i++;
    const a = frames[i];
    const b = frames[i + 1];
    flat = mixFlat(a.state, b.state, smoothstep((p - a.at) / (b.at - a.at)));
  }
  const { shot, ...rest } = flat;
  return { ...rest, focus: shot.focus, trayOpen: rest.gate ? 1 : 0, camera: toCamera(shot, framing, aspect) };
}
