import { useSyncExternalStore } from "react";
import type { StoryPosition } from "./position";

let value: StoryPosition = 0;
let jumps = 0;
const listeners = new Set<() => void>();

/** The current story position. The 3D scene reads `story.get()` every frame; DOM uses the hook. */
export const story = {
  get: () => value,
  set(p: StoryPosition) {
    if (p === value) return;
    value = p;
    listeners.forEach((l) => l());
  },
  /** Counts jumps (reload restoring the scroll, an anchor link, the End key): the stage cuts instead of flying over. */
  jumps: () => jumps,
  markJump() {
    jumps++;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useStoryPosition(): StoryPosition {
  return useSyncExternalStore(story.subscribe, story.get, () => 0);
}
