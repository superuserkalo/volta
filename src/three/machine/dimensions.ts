// Proportions estimated from VOLTA's reveal video (first and last frames)
// and the prototype photos. Unit: 1 = machine height. x = width, y = up,
// z = depth with the front at +z. The machine stands on y = 0.

export const DIM = {
  height: 1,
  /** Body width between the side plates. */
  bodyW: 0.33,
  plate: 0.014,
  /** Side plates run from the back to just behind the front stack. */
  plateBack: -0.475,
  plateFront: 0.43,
  front: 0.44,
  back: -0.47,

  // Front stack, bottom to top (fractions of height, measured on frame 1).
  plinth: [0, 0.105] as const,
  door: [0.12, 0.46] as const,
  panel: [0.47, 0.7] as const,
  head: [0.735, 1] as const,

  /** How far the head unit slides forward when the machine opens. */
  headSlide: 0.2,
  basketRadius: 0.072, // 49 mm basket against a ~340 mm tall machine
} as const;

export const HALF_W = DIM.bodyW / 2;
export const PLATE_X = HALF_W + DIM.plate / 2;
