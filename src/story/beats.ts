export type BeatId =
  | "hero"
  | "specs"
  | "pressure"
  | "temperature"
  | "control"
  | "power"
  | "repair"
  | "lab"
  | "quote"
  | "cta";

export type Tone = "dark" | "light";

// lengthVh = scroll distance the beat occupies, in viewport heights × 100.
// Sized to what happens in the beat: the copy is pinned for (length − 100vh),
// and the next beat's copy scrolls in over the last 100vh.
export const BEATS: readonly { id: BeatId; lengthVh: number; tone: Tone }[] = [
  { id: "hero", lengthVh: 120, tone: "dark" },
  { id: "specs", lengthVh: 240, tone: "light" },
  { id: "pressure", lengthVh: 200, tone: "dark" },
  { id: "temperature", lengthVh: 200, tone: "dark" },
  { id: "control", lengthVh: 240, tone: "dark" },
  { id: "power", lengthVh: 400, tone: "dark" },
  { id: "repair", lengthVh: 300, tone: "light" },
  { id: "lab", lengthVh: 180, tone: "dark" },
  { id: "quote", lengthVh: 220, tone: "dark" },
  { id: "cta", lengthVh: 100, tone: "dark" },
] as const;

export const beatIndex = (id: BeatId) => BEATS.findIndex((b) => b.id === id);

/** Story position `vh` viewport-heights×100 into a beat. Keyframes are placed in vh so a move takes the same scroll everywhere. */
export function storyAt(id: BeatId, vh: number): number {
  const i = beatIndex(id);
  return i + vh / BEATS[i].lengthVh;
}
