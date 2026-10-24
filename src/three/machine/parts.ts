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
  { id: "side-left", group: "exterior", explode: [-0.75, 0, 0], label: null },
  { id: "side-right", group: "exterior", explode: [0.75, 0, 0], label: null },
  { id: "top-deck", group: "exterior", explode: [0, 0.42, -0.05], label: null },
  { id: "rear-lid", group: "exterior", explode: [0, 0.62, -0.1], label: null },
  { id: "control-head", group: "exterior", explode: [0, 0.18, 0.5], label: null },
  { id: "front-lid", group: "exterior", explode: [0, 0.5, 0.55], label: null },
  { id: "modular-port", group: "exterior", explode: [0, 0.34, 0.52], label: "MODULAR PORT, TOP" },
  { id: "front-door", group: "exterior", explode: [0, -0.04, 0.62], label: null },
  { id: "cup-tray", group: "exterior", explode: [0, -0.08, 0.82], label: null },
  { id: "drip-grate", group: "exterior", explode: [0, 0.1, 0.8], label: null },
  { id: "cup-rest", group: "exterior", explode: [0.12, 0.2, 0.55], label: null },
  { id: "handle", group: "exterior", explode: [0, 0.75, -0.25], label: null },
  { id: "handle-knob", group: "exterior", explode: [0, 0.55, -0.1], label: null },
  { id: "b-mount", group: "power", explode: [0, 0, -0.45], label: "B-MOUNT" },
  { id: "battery", group: "power", explode: [0, -0.05, -0.85], label: null },
  { id: "dc-port", group: "power", explode: [0.1, 0.15, -0.4], label: "DC PORT" },
  { id: "reservoir", group: "internal", explode: [0, 0.95, -0.2], label: null },
  { id: "boiler", group: "internal", explode: [0.38, 0.36, 0.05], label: "BOILER" },
  { id: "pump", group: "internal", explode: [-0.38, -0.05, -0.1], label: "PUMP" },
  { id: "group", group: "internal", explode: [0, 0.15, 0.32], label: null },
  { id: "basket", group: "internal", explode: [0, -0.12, 0.42], label: "49 MM BASKET" },
  { id: "board", group: "internal", explode: [-0.3, -0.2, -0.05], label: null },
];

export const partDef = (id: PartId) => PARTS.find((p) => p.id === id)!;
