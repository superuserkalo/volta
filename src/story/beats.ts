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
export const BEATS: readonly { id: BeatId; lengthVh: number; tone: Tone }[] = [
  { id: "hero", lengthVh: 150, tone: "dark" },
  { id: "specs", lengthVh: 300, tone: "light" },
  { id: "pressure", lengthVh: 200, tone: "dark" },
  { id: "temperature", lengthVh: 200, tone: "dark" },
  { id: "control", lengthVh: 200, tone: "dark" },
  { id: "power", lengthVh: 300, tone: "dark" },
  { id: "repair", lengthVh: 400, tone: "light" },
  { id: "lab", lengthVh: 200, tone: "dark" },
  { id: "quote", lengthVh: 250, tone: "dark" },
  { id: "cta", lengthVh: 100, tone: "dark" },
] as const;

export const beatIndex = (id: BeatId) => BEATS.findIndex((b) => b.id === id);
