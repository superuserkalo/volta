import type { PartId, Vec3 } from "@/story/scene-state";

export type PartGroup = "exterior" | "power" | "internal";

export interface PartDef {
  id: PartId;
  group: PartGroup;
  /** Offset at explode = 1, in machine units. */
  explode: Vec3;
  /** Blueprint label. Only nouns that appear in VOLTA's copy. */
  label: string | null;
}

export const ALLOWED_LABELS = [
  "PUMP",
  "BOILER",
  "49 MM BASKET",
  "B-MOUNT",
  "DC PORT",
  "MODULAR PORT, TOP",
  "12 BAR",
  "±0.5 °C",
  "49 MM",
  "ANY",
] as const;

export const PARTS: readonly PartDef[] = [
  { id: "body", group: "exterior", explode: [0, 0, 0], label: null },
  { id: "side-left", group: "exterior", explode: [-0.525, 0, 0], label: null },
  { id: "side-right", group: "exterior", explode: [0.525, 0, 0], label: null },
  { id: "top-deck", group: "exterior", explode: [0, 0.294, -0.035], label: null },
  { id: "rear-lid", group: "exterior", explode: [0, 0.434, -0.07], label: null },
  { id: "control-head", group: "exterior", explode: [0, 0.126, 0.35], label: null },
  { id: "front-lid", group: "exterior", explode: [0, 0.35, 0.385], label: null },
  { id: "modular-port", group: "exterior", explode: [0, 0.238, 0.364], label: "MODULAR PORT, TOP" },
  { id: "front-door", group: "exterior", explode: [0, -0.028, 0.434], label: null },
  { id: "cup-tray", group: "exterior", explode: [0, -0.056, 0.574], label: null },
  { id: "drip-grate", group: "exterior", explode: [0, 0.07, 0.56], label: null },
  { id: "cup-rest", group: "exterior", explode: [0.084, 0.14, 0.385], label: null },
  { id: "handle", group: "exterior", explode: [0, 0.525, -0.175], label: null },
  { id: "handle-knob", group: "exterior", explode: [0, 0.385, -0.07], label: null },
  { id: "b-mount", group: "power", explode: [0, 0, -0.315], label: "B-MOUNT" },
  { id: "battery", group: "power", explode: [0, -0.035, -0.595], label: null },
  { id: "dc-port", group: "power", explode: [0.07, 0.105, -0.28], label: "DC PORT" },
  { id: "reservoir", group: "internal", explode: [0, 0.665, -0.14], label: null },
  { id: "boiler", group: "internal", explode: [0.266, 0.252, 0.035], label: "BOILER" },
  { id: "pump", group: "internal", explode: [-0.266, -0.035, -0.07], label: "PUMP" },
  { id: "group", group: "internal", explode: [0, 0.105, 0.224], label: null },
  { id: "basket", group: "internal", explode: [0, -0.084, 0.294], label: "49 MM BASKET" },
  { id: "board", group: "internal", explode: [-0.21, -0.14, -0.035], label: null },
];

export const partDef = (id: PartId) => PARTS.find((p) => p.id === id)!;
