# VOLTA: concept redesign

An open-source, unofficial redesign of [volta.coffee](https://volta.coffee), the portable battery-powered espresso machine from Austria. The page tells VOLTA's own story as one continuous 3D scroll: a procedural model of the machine stays on screen and turns into a blueprint, shows its insides, takes a B-mount battery, comes apart into its parts, and folds out its cup tray.

> **Unofficial.** This project is not affiliated with or endorsed by VOLTA. The VOLTA name, logo, product copy, photos and video belong to VOLTA. All copy is used verbatim from volta.coffee. The site ships with `noindex` until VOLTA chooses to adopt it.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · three.js via react-three-fiber · anime.js 4 · Effect · Resend · Vercel

## Run it

```sh
pnpm install
cp .env.example .env.local   # SIGNUP_DRY_RUN=1 logs signups instead of storing them
pnpm dev
```

- `pnpm test`: unit tests (copy guard, story/scene math, signup, model registry)
- `pnpm e2e`: Playwright at 1440×900 and 390×844
- `/lab` (dev only): model viewer with sliders for every scene parameter

## Signup

Signups are stored by the maintainer of this site in their own Resend segment (`RESEND_API_KEY`, `RESEND_SEGMENT_ID`), not by VOLTA. The forms say so. No email is sent on signup.

## Docs

- Design: `docs/superpowers/specs/2026-10-25-volta-scroll-site-design.md`
- Plan: `docs/superpowers/plans/2026-10-25-volta-scroll-site.md`
- Research (verbatim copy, references, animejs.com scroll study): `docs/research/`
