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
  /** 0 front door closed … 1 folded down into the cup tray. */
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

type Flat = Omit<SceneState, "camera"> & { shot: Shot };

function mixFlat(a: Flat, b: Flat, k: number): Flat {
  return {
    shot: {
      focus: mix3(a.shot.focus, b.shot.focus, k),
      dist: mix(a.shot.dist, b.shot.dist, k),
      elev: mix(a.shot.elev, b.shot.elev, k),
      fov: mix(a.shot.fov, b.shot.fov, k),
      screen: [mix(a.shot.screen[0], b.shot.screen[0], k), mix(a.shot.screen[1], b.shot.screen[1], k)],
    },
    machineYaw: mix(a.machineYaw, b.machineYaw, k),
    paper: mix(a.paper, b.paper, k),
    blueprint: mix(a.blueprint, b.blueprint, k),
    xray: mix(a.xray, b.xray, k),
    callouts: mix(a.callouts, b.callouts, k),
    explode: mix(a.explode, b.explode, k),
    trayOpen: mix(a.trayOpen, b.trayOpen, k),
    batteryAttach: mix(a.batteryAttach, b.batteryAttach, k),
    boilerGlow: mix(a.boilerGlow, b.boilerGlow, k),
    panelLights: mix(a.panelLights, b.panelLights, k),
    // Discrete fields switch when the next keyframe is reached.
    battery: a.battery,
    highlight: a.highlight,
  };
}

/**
 * Converts a shot (what to look at, from how far) into a camera for the
 * framing. `screen` offsets the subject from the screen center so it sits
 * beside the text (landscape) or above the text panel (portrait).
 */
function toCamera(shot: Shot, framing: Framing): SceneState["camera"] {
  const dist = framing === "portrait" ? shot.dist * 1.45 : shot.dist;
  const [sx, sy] = framing === "portrait" ? [0, 0.42] : shot.screen;
  const fovRad = (shot.fov * Math.PI) / 180;
  const halfH = Math.tan(fovRad / 2) * dist;
  // Moving the look-at point opposite to the desired screen offset shifts the subject.
  const target: Vec3 = [shot.focus[0] - sx * halfH, shot.focus[1] - sy * halfH, shot.focus[2]];
  const position: Vec3 = [target[0], target[1] + Math.sin(shot.elev) * dist, target[2] + Math.cos(shot.elev) * dist];
  return { position, target, fov: shot.fov };
}

export function sceneStateAt(p: StoryPosition, framing: Framing): SceneState {
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
  return { ...rest, camera: toCamera(shot, framing) };
}
