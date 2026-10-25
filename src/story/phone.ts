/**
 * Phone layout: the machine has a window across the top of the screen and the
 * copy scrolls up underneath it, like content under a sticky header. Nothing
 * ever sits on top of the machine, and long copy (the hero form, the power
 * cards) scrolls instead of being squeezed onto one screen.
 */

/** Below this width the page uses the phone layout (Tailwind's `md` breakpoint). */
export const PHONE_MAX_WIDTH = 767;

/** Height of the machine window, in svh. Each section's copy starts right below it. */
export const PHONE_WINDOW_VH = 54;

export const isPhone = (width: number) => width <= PHONE_MAX_WIDTH;
