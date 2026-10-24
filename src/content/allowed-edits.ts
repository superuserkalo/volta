// The only strings on the page that are not verbatim from volta.coffee.
// Dates: the live site says Winter 2026 in the hero and Fall 2026 at the
// bottom; the later date is used for both.

export const notices = {
  signup:
    "Unofficial concept site, not affiliated with VOLTA. Your email is stored by this site's maintainer only to tell you when VOLTA launches. Reply to any email to be removed.",
  footer: "Unofficial concept redesign. Not affiliated with or endorsed by VOLTA.",
  signupError: "Something went wrong. Please try again.",
} as const;

export const allowedEdits: readonly string[] = [
  "Founders Edition · Winter 2026",
  "We're starting with a limited Founders Edition, ready in the winter. Early subscribers get first access and the first production slots.",
  ...Object.values(notices),
];
