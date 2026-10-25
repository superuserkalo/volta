import { BEATS, type BeatId } from "./beats";

/** Story position: beat index + progress through that beat (0 … BEATS.length). */
export type StoryPosition = number;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Maps a scroll offset to a story position, given each beat section's top and height in px. */
export function positionFromScroll(scrollY: number, tops: readonly number[], heights: readonly number[]): StoryPosition {
  const n = tops.length;
  if (n === 0 || scrollY <= tops[0]) return 0;
  // Section tops can be fractional while scrollY is whole pixels: within 1px counts as the section's start.
  const EPS = 1;
  for (let i = n - 1; i >= 0; i--) {
    if (scrollY >= tops[i] - EPS) return i + clamp((scrollY - tops[i]) / Math.max(1, heights[i]), 0, 1);
  }
  return 0;
}

/** Inverse of positionFromScroll: the scroll offset that shows story position `p`. */
export function scrollFromPosition(p: StoryPosition, tops: readonly number[], heights: readonly number[]): number {
  const n = tops.length;
  if (n === 0 || p <= 0) return tops[0] ?? 0;
  if (p >= n) return tops[n - 1] + heights[n - 1];
  const i = Math.floor(p);
  return tops[i] + (p - i) * heights[i];
}

export function beatAt(p: StoryPosition): { id: BeatId; t: number } {
  const last = BEATS.length - 1;
  if (p <= 0) return { id: BEATS[0].id, t: 0 };
  if (p >= BEATS.length) return { id: BEATS[last].id, t: 1 };
  const i = Math.floor(p);
  return { id: BEATS[i].id, t: p - i };
}

/** Exponential smoothing toward a target; frame-rate independent. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}
