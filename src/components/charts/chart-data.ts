// Exact geometry of the two charts on volta.coffee (viewBox 0 0 800 560),
// copied from their inline SVGs (docs/research/volta-site/chart-*.svg).

export const VIEWBOX = "0 0 800 560";

export const GRID_Y = [
  { y: 127, label: "12" },
  { y: 257, label: "9" },
  { y: 387, label: "6" },
  { y: 517, label: "3" },
] as const;

export const TIME_TICKS = [
  { x: 70, label: "0 S", anchor: "start" },
  { x: 400, label: "15 S", anchor: "middle" },
  { x: 760, label: "30 S", anchor: "end" },
] as const;

/** Drawn back to front, as on their site: custom, lever, flat 9 bar. */
export const CURVES = [
  {
    key: "custom",
    d: "M 70 517 C 110 517 120 350 170 330 C 220 310 250 210 330 205 C 410 200 430 300 520 310 C 610 320 650 240 760 250",
    stroke: "#5B7A94",
    width: 2.5,
    dash: "7 8",
  },
  {
    key: "lever",
    d: "M 70 517 L 130 517 C 170 517 175 240 235 235 C 260 233 270 245 320 270 C 450 335 600 420 760 445",
    stroke: "#868B8F",
    width: 2.5,
  },
  {
    key: "flat",
    d: "M 70 517 L 140 517 C 190 517 195 257 250 257 L 760 257",
    stroke: "#BB6622",
    width: 3.5,
  },
] as const;

export const TEMP_RANGE = { min: 85, max: 99, x0: 70, x1: 760 } as const;
export const xForTemp = (v: number) => TEMP_RANGE.x0 + ((v - TEMP_RANGE.min) / (TEMP_RANGE.max - TEMP_RANGE.min)) * (TEMP_RANGE.x1 - TEMP_RANGE.x0);

export const ROASTS = [
  { label: "DARK ROAST", value: 88, y: 146 },
  { label: "MEDIUM ROAST", value: 92, y: 266 },
  { label: "LIGHT ROAST", value: 96, y: 386 },
] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (k: number) => 1 - Math.pow(1 - k, 3);

/** How much of curve `i` (0 custom, 1 lever, 2 flat) is drawn at beat progress t. Flat draws first, as the classic. */
export function drawAmount(t: number, i: number): number {
  const windows = [
    [0.4, 0.85],
    [0.25, 0.7],
    [0.08, 0.55],
  ] as const;
  const [a, b] = windows[i];
  return t >= b ? 1 : ease(clamp01((t - a) / (b - a)));
}
