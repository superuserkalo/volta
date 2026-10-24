import type { Highlight, PartId, SceneState } from "@/story/scene-state";
import type { PartGroup } from "./parts";

export type Kind =
  | "alu"
  | "black"
  | "copper"
  | "dark"
  | "rubber"
  | "steel"
  | "glass"
  | "pcb"
  | "battery"
  | "battery-label"
  | "led-0"
  | "led-1"
  | "led-2"
  | "led-3";

export type ModeState = Pick<SceneState, "blueprint" | "xray" | "explode" | "boilerGlow" | "panelLights"> & {
  highlight: Highlight;
};

export interface Look {
  visible: boolean;
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  edgeOpacity: number;
}

const PAPER_FILL = "#f3f1ee";
const COPPER = "#bb6622";

const BASE: Record<Kind, { color: string; metalness: number; roughness: number }> = {
  alu: { color: "#c9cdd1", metalness: 0.9, roughness: 0.36 },
  black: { color: "#202224", metalness: 0.35, roughness: 0.42 },
  copper: { color: "#bb6622", metalness: 0.85, roughness: 0.32 },
  dark: { color: "#0b0c0d", metalness: 0.2, roughness: 0.7 },
  rubber: { color: "#1d1f21", metalness: 0, roughness: 0.9 },
  steel: { color: "#9aa0a6", metalness: 1, roughness: 0.28 },
  glass: { color: "#8fb4c8", metalness: 0, roughness: 0.1 },
  pcb: { color: "#1f3a2c", metalness: 0.2, roughness: 0.6 },
  battery: { color: "#2b2f33", metalness: 0.2, roughness: 0.6 },
  "battery-label": { color: "#3f7f86", metalness: 0.1, roughness: 0.5 },
  "led-0": { color: "#4e8c6a", metalness: 0, roughness: 0.4 },
  "led-1": { color: "#7d6bd6", metalness: 0, roughness: 0.4 },
  "led-2": { color: "#d0573f", metalness: 0, roughness: 0.4 },
  "led-3": { color: "#d0573f", metalness: 0, roughness: 0.4 },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function mixHex(a: string, b: string, k: number) {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - k) + ((pb >> shift) & 255) * k);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

/** How one material kind looks on one part for the current render mode. Pure; the scene only applies it. */
export function lookFor(kind: Kind, group: PartGroup, part: PartId, s: ModeState): Look {
  const base = BASE[kind];
  const bp = clamp01(s.blueprint);
  const xr = clamp01(s.xray);
  const exploding = s.explode > 0.01 ? 1 : 0;

  let visible = true;
  let opacity = 1;
  if (group === "internal") {
    const show = Math.max(clamp01(xr * 1.6), exploding);
    visible = show > 0.001;
    opacity = show;
  } else if (group === "exterior" || group === "power") {
    // Ghost the shell in x-ray; the power parts on the back stay solid.
    if (group === "exterior") opacity = 1 - 0.88 * xr;
  }

  if (kind === "glass") opacity *= 0.45;

  let emissive = "#000000";
  let emissiveIntensity = 0;
  const led = kind.startsWith("led-") ? Number(kind.slice(4)) : -1;
  if (led >= 0) {
    const on = clamp01(s.panelLights - led);
    emissive = base.color;
    emissiveIntensity = on * 2.2;
  } else if (s.highlight && s.highlight === part) {
    emissive = COPPER;
    emissiveIntensity = part === "boiler" ? 0.35 + 1.4 * clamp01(s.boilerGlow) : 0.45;
  }

  return {
    visible,
    color: mixHex(s.highlight === part && led < 0 ? mixHex(base.color, COPPER, 0.35) : base.color, PAPER_FILL, bp),
    opacity,
    metalness: base.metalness * (1 - bp),
    roughness: base.roughness + (1 - base.roughness) * bp,
    emissive,
    emissiveIntensity: emissiveIntensity * (1 - bp * 0.6),
    // Ink lines in blueprint; faint lines on the ghosted shell in x-ray so its outline stays readable.
    edgeOpacity: visible ? Math.max(bp, group === "exterior" ? xr * 0.35 : 0) : 0,
  };
}
