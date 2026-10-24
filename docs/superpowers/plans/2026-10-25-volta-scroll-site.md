# Volta Scroll-Story Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild volta.coffee as a one-page Next.js site where a single procedural 3D VOLTA machine stays on screen and transforms through ten scroll beats, with verbatim copy and a working Resend signup.

**Architecture:** All copy lives in one typed module guarded by a test against `docs/research/volta-site/copy-verbatim.txt`. Scroll position becomes a single global "story position" `p` (beat index + progress within beat) via anime.js `onScroll`; a pure function `sceneStateAt(p, framing)` turns `p` into everything the 3D scene needs (camera, render-mode weights, explode, tray, battery, highlights), and the r3f scene damps toward that state each frame. The 3D machine is procedural three.js geometry built from named parts in a registry.

**Tech Stack:** Next.js 16.4 (App Router, `src/`), React 19.3, TypeScript, Tailwind CSS 4.3, shadcn (Button, Input), lucide-react / @hugeicons/react, three 0.186 + @react-three/fiber 9.8 + @react-three/drei 10.7, animejs 4.5, effect 4.0 (`Schema`, `Context.Service`, `Layer`, `Data.TaggedError`), resend 6.34 (contacts with `segments: [{ id }]`), Vitest 5, Playwright 1.64. Package manager: pnpm.

**Spec:** `docs/superpowers/specs/2026-10-25-volta-scroll-site-design.md`

## Global Constraints

- Copy: every user-visible string comes from `copy-verbatim.txt`. Only allowed edits: both "Founders Edition · …" dates read `Founders Edition · Winter 2026`; "ready in the fall." reads "ready in the winter."; the unofficial/privacy notices; aria/alt text built from the copy's own nouns.
- Never show invented numbers (part counts, capacities, run times, weights, dimensions) or the steam wand. Wherever internals are visible, show `Prototype. Details might change.`
- Fonts: Instrument Sans (UI/headings), Martian Mono (labels/specs) via `next/font/google`.
- Color tokens: `--bg #131516`, `--bg-raised #1B1E20`, `--line #33373A`, `--text #E9E9E9`, `--text-2 #AEB2B5`, `--text-3 #868B8F`, `--text-4 #5F6367`, `--copper #BB6622`, `--copper-dark #8A4A17`, `--copper-light #CC8340`, `--custom-blue #5B7A94`, `--ok-green #4E8C6A`, blueprint paper `--paper #D9D6D3`, blueprint ink `--ink #2A2C2E`.
- Site is `noindex, nofollow` (Next metadata `robots`) and the README states: unofficial concept redesign, not affiliated with or endorsed by VOLTA; VOLTA's brand assets, copy, photos and video belong to VOLTA.
- Signup: live into the maintainer's Resend account (`RESEND_API_KEY`, `RESEND_SEGMENT_ID`); no email is sent on signup; the unofficial/privacy notice sits directly under each form's button.
- Same journey on 390px and 1440px; no horizontal page scroll; 16px side gutter on mobile.
- `prefers-reduced-motion: reduce` and no-WebGL get a static poster and all copy, no scrubbing.
- Renderer: one WebGL2 canvas (three.js). No vGPU, no WebGPU requirement. DPR capped at 1.5 on viewports < 768px, 2 otherwise.
- Footer links: `https://www.instagram.com/_voltacoffee`, `https://www.youtube.com/@volta.coffee`, `https://volta.coffee/impressum/`.

## Review Focus

1. **Anchor jumps** ("Get early access" in the header jumps ~19 screens): the scene must land in the CTA state within ~1.5 s, not freeze mid-explode. → e2e test in Task 6.
2. **Reload mid-page** (browser restores scroll at the Power beat): the scene must start in the Power state, not play from the hero. → e2e test in Task 6.
3. **Phone rotation / resize** mid-page: beat boundaries recompute; the current section stays the current section. → e2e test in Task 6.
4. **Email edge input**: surrounding spaces, uppercase, invalid, already-subscribed, double-click submit. Trim and accept, reject invalid with a message, treat duplicate as success, one request per click. → unit tests in Task 4 + e2e in Task 4.
5. **No WebGL / reduced motion / slow 3D**: all copy readable over a poster, forms work, no blank screen. → e2e tests in Task 10.

---

## File Structure

```
src/app/layout.tsx              fonts, tokens, metadata (noindex), <Header/>
src/app/page.tsx                <Stage/> + all sections in order + <Footer/>
src/app/globals.css             Tailwind v4 @theme tokens
src/app/actions/subscribe.ts    server action → runs subscribe program
src/app/lab/page.tsx            dev-only model viewer (notFound() in production)
src/content/copy.ts             all verbatim strings, typed
src/content/allowed-edits.ts    the allowed non-verbatim strings
src/story/beats.ts              beat ids, order, lengths (vh)
src/story/position.ts           scroll → story position math, damping
src/story/keyframes.ts          scene keyframes per framing
src/story/scene-state.ts        SceneState type + sceneStateAt()
src/story/store.ts              tiny external store for p (useSyncExternalStore)
src/story/use-story-scroll.ts   anime.js onScroll wiring → store
src/components/sections/*.tsx   one file per beat + Section.tsx wrapper
src/components/chrome/          Header, Footer, ProgressRail, UnofficialNote
src/components/charts/          PressureChart, TemperatureChart, chart-data.ts
src/components/signup/SignupForm.tsx
src/lib/signup/                 email.ts, contacts.ts, subscribe.ts (+ tests)
src/three/Stage.tsx             client-only canvas host, fallbacks, poster
src/three/Scene.tsx             lights, background, CameraRig, Machine
src/three/CameraRig.tsx
src/three/machine/dimensions.ts proportions
src/three/machine/parts.ts      part registry (ids, groups, explode vectors, labels)
src/three/machine/materials.ts  shaded / blueprint / x-ray materials
src/three/machine/Machine.tsx   assembles parts, applies SceneState
src/three/machine/exterior/*.tsx, internals/*.tsx, power/*.tsx
src/three/machine/Callouts.tsx  blueprint labels + leader lines
public/brand/                   logo-volta.svg, logo-bean.svg, bene.jpg, volta-ui.webp
public/media/                   poster-hero.webp, poster-hero-mobile.webp
e2e/*.spec.ts
```

---

### Task 1: Scaffold, tokens, test tooling

**Files:**
- Create: Next app at repo root (`src/`, App Router, TS, Tailwind 4, ESLint), `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `vitest.config.ts`, `playwright.config.ts`, `e2e/smoke.spec.ts`, `.env.example`, `README.md`
- Copy: `docs/research/volta-site/{logo-volta.svg,logo-bean.svg,bene.jpg,volta-ui.webp}` → `public/brand/`

**Interfaces:**
- Produces: Tailwind tokens from Global Constraints as `bg-bg`, `text-text`, `text-copper`, `font-sans` (Instrument Sans), `font-mono` (Martian Mono) etc.; shadcn `Button`, `Input` in `src/components/ui/`; scripts `pnpm test` (vitest), `pnpm e2e` (playwright, starts `pnpm dev` on :3000, projects `desktop` 1440×900 and `mobile` 390×844).

- [ ] **Step 1:** `pnpm create next-app@16.4.3 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm` (keep existing README/docs), then `pnpm dlx shadcn@4.22.1 init` and `add button input`. Install pinned deps: `three@0.186.1 @react-three/fiber@9.8.2 @react-three/drei@10.7.9 animejs@4.5.0 effect@4.0.6 resend@6.34.1 lucide-react @hugeicons/react @hugeicons/core-free-icons`, dev: `vitest@5.0.5 @playwright/test@1.64.1 @types/three`.
- [ ] **Step 2: Write `e2e/smoke.spec.ts`:** page has `<meta name="robots" content="noindex, nofollow">`; `document.body` background computes to `rgb(19, 21, 22)`; at mobile project `document.documentElement.scrollWidth <= 390`.
- [ ] **Step 3:** Run `pnpm e2e smoke` → FAIL.
- [ ] **Step 4:** Implement tokens in `globals.css` (`@theme`), fonts in `layout.tsx`, `metadata.robots = { index: false, follow: false }`, title `VOLTA – The world’s most uncompromising portable espresso machine. Coming soon.` (verbatim `<title>`). README: what this is, the unofficial notice from Global Constraints, `pnpm dev/test/e2e`, env vars. `.env.example`: `RESEND_API_KEY=`, `RESEND_SEGMENT_ID=`, `SIGNUP_DRY_RUN=1`.
- [ ] **Step 5:** `pnpm e2e smoke` → PASS (both projects); `pnpm build` succeeds.
- [ ] **Step 6:** Commit `chore: scaffold next app with volta tokens and test tooling`.

### Task 2: Verbatim copy module + guard

**Files:**
- Create: `src/content/copy.ts`, `src/content/allowed-edits.ts`, `src/content/copy.test.ts`

**Interfaces:**
- Produces: `export const copy` (`as const`) with keys: `nav.cta`; `hero.{eyebrow,headline: string[],body,cta,placeholder,loading,success,note,caption}`; `specs: {value,label}[]` (4); `pressure.{kicker,headline,body,meta,legend: string[]}`; `temperature.{kicker,headline,body,meta,hold,target, roasts: {label,value}[]}`; `control.{kicker,headline,body,rows: {label,value}[]}`; `power.{kicker,headline,body,cards: {tag,title,body}[]}`; `repair.{kicker,headline,body,rows: {label,value}[]}`; `lab.{kicker,headline,body,cards: {status,title,body}[],meta}`; `quote.{text,name,role}`; `cta.{eyebrow,headline,body,cta,placeholder,loading,success,note}`; `footer.{links: {label,href}[],legal}`. `export const allowedEdits: readonly string[]` (the two Winter strings, "ready in the winter.", the notice strings from Task 4/7). `export const notices = { signup: string, footer: string, signupError: string }` lives in `allowed-edits.ts`.

- [ ] **Step 1: Write `copy.test.ts`:** collect every string leaf of `copy`; normalize whitespace; for each, assert it is a substring of `copy-verbatim.txt` (case-insensitive, since the site uppercases via CSS) OR is in `allowedEdits`. Also: `copy.hero.eyebrow === "Founders Edition · Winter 2026"`, `copy.cta.eyebrow === "Founders Edition · Winter 2026"`, `copy.cta.body` contains `"ready in the winter."`, and no leaf contains `"Fall 2026"` or `"in the fall"`.
- [ ] **Step 2:** `pnpm test copy` → FAIL (module missing).
- [ ] **Step 3:** Fill `copy.ts` by copying lines from `copy-verbatim.txt` (keep curly/straight quotes, `·`, `±`, `°`, `—` exactly). Store sentence case; uppercase is a CSS concern. Pressure meta is `FLAT · LEVER · CUSTOM · 0.5 BAR RESOLUTION` etc. Notices (exact):
  - `notices.signup`: `Unofficial concept site, not affiliated with VOLTA. Your email is stored by this site's maintainer only to tell you when VOLTA launches. Reply to any email to be removed.`
  - `notices.footer`: `Unofficial concept redesign. Not affiliated with or endorsed by VOLTA.`
  - `notices.signupError`: `Something went wrong. Please try again.`
- [ ] **Step 4:** `pnpm test copy` → PASS.
- [ ] **Step 5:** Commit `feat: verbatim copy module with guard test`.

### Task 3: Static page — every section in the DOM, responsive layout

**Files:**
- Create: `src/story/beats.ts`, `src/components/sections/{Section,Hero,Specs,Pressure,Temperature,Control,Power,Repair,Lab,Quote,FinalCta}.tsx`, `src/components/chrome/{Header,Footer,UnofficialNote}.tsx`, `e2e/content.spec.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type BeatId = 'hero'|'specs'|'pressure'|'temperature'|'control'|'power'|'repair'|'lab'|'quote'|'cta'
  export const BEATS: readonly { id: BeatId; lengthVh: number; tone: 'dark'|'light' }[]
  // lengths: hero 150, specs 300, pressure 200, temperature 200, control 200, power 300, repair 300, lab 200, quote 100, cta 100
  // tone light: specs, repair; all others dark
  ```
  `<Section beat={BeatId}>` renders `<section id={beat} data-beat={beat} style={{ minHeight: `${lengthVh}svh` }}>` with an inner `position: sticky; top: 0; height: 100svh` text layer. Text sits left on desktop (max-w 560px, machine occupies right/center), in a bottom panel on mobile (gradient `--bg` → transparent, max 48svh). `Header` = logo + outline button `copy.nav.cta` linking `#cta`. `Footer` = logo, links, `copy.footer.legal`, `notices.footer`.
- Pressure, Temperature and Repair sections (internals visible) show `copy.hero.caption` ("Prototype. Details might change.") as a mono caption in their text layer.
- Charts and signup forms are placeholders in this task (empty `div` with `data-slot="pressure-chart"` / `temperature-chart` / `signup`), filled by Tasks 4 and 7.

- [ ] **Step 1: Write `e2e/content.spec.ts`:** for each project: every headline in `copy` is visible after `scrollIntoViewIfNeeded`; all 10 `section[data-beat]` exist in `BEATS` order; footer links have the three exact hrefs; `scrollWidth <= innerWidth`; quote section shows `img[alt="Benedict Heinzl"]`; `#pressure`, `#temperature`, `#repair` each contain the text `Prototype. Details might change.`
- [ ] **Step 2:** `pnpm e2e content` → FAIL.
- [ ] **Step 3:** Implement sections with copy from `copy`. Typography: headlines Instrument Sans 500, `clamp(2.5rem, 6vw, 5rem)`, tracking -0.03em; kickers/meta Martian Mono uppercase, copper for kickers; tables (control, repair rows) as `<dl>` with 1px `--line` rules, as on the current site. Specs strip: 4 items, 2×2 grid on mobile.
- [ ] **Step 4:** `pnpm e2e content` → PASS on both projects.
- [ ] **Step 5:** Commit `feat: static page with all sections and verbatim copy`.

### Task 4: Signup — Effect program, server action, form

**Files:**
- Create: `src/lib/signup/{email.ts,contacts.ts,subscribe.ts,subscribe.test.ts}`, `src/app/actions/subscribe.ts`, `src/components/signup/SignupForm.tsx`, `e2e/signup.spec.ts`
- Modify: `Hero.tsx`, `FinalCta.tsx` (replace `data-slot="signup"` placeholder)

**Interfaces:**
- Produces:
  ```ts
  // email.ts
  export class InvalidEmail extends Data.TaggedError('InvalidEmail')<{}> {}
  export const decodeEmail: (input: unknown) => Effect.Effect<string, InvalidEmail> // trims; 3–254 chars; /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // contacts.ts
  export class ProviderError extends Data.TaggedError('ProviderError')<{ cause: unknown }> {}
  export class Contacts extends Context.Service<Contacts, { add: (email: string) => Effect.Effect<void, ProviderError> }>()('Contacts') {}
  export const ContactsResend: Layer.Layer<Contacts>   // resend.contacts.create({ email, segments: [{ id: RESEND_SEGMENT_ID }] }); a "contact already exists" error counts as success
  export const ContactsDryRun: Layer.Layer<Contacts>   // logs, succeeds; used when SIGNUP_DRY_RUN=1 or RESEND_API_KEY missing in dev
  // subscribe.ts
  export type SubscribeResult = { status: 'ok' } | { status: 'invalid' } | { status: 'error' }
  export const subscribe: (input: unknown) => Effect.Effect<SubscribeResult, never, Contacts>
  // app/actions/subscribe.ts  ('use server')
  export async function subscribeAction(prev: SubscribeResult | null, form: FormData): Promise<SubscribeResult>
  ```
  `<SignupForm variant="hero"|"cta">` uses `useActionState(subscribeAction)`; states: idle → pending (button text `copy.hero.loading` "Loading…", button disabled) → ok (form replaced by `copy.hero.success`) / invalid (input marked `aria-invalid`, browser's native `type=email` validation message shown via `reportValidity()`; no new copy) / error (form kept, `notices.signupError` shown in an `aria-live="polite"` line). Notice `notices.signup` under the button, `text-xs font-mono text-text-4`.
  Production with `RESEND_API_KEY` missing → `ContactsResend` fails with ProviderError (never silently dry-runs in production).

- [ ] **Step 1: Write `subscribe.test.ts`** with a test layer recording calls:
  - `"  Ana@Example.com  "` → `{status:'ok'}`, recorded `"Ana@Example.com"` (trimmed, case kept)
  - `"nope"`, `""`, `42`, `"a@b"` → `{status:'invalid'}`, nothing recorded
  - layer failing with ProviderError → `{status:'error'}`
  - layer that simulates Resend's duplicate error through `ContactsResend`'s mapping (test the mapping function `isAlreadyExists(error): boolean` exported from contacts.ts with the Resend error shape `{ name: 'validation_error', message: 'Contact already exists' }`) → ok
- [ ] **Step 2:** `pnpm test signup` → FAIL.
- [ ] **Step 3:** Implement the three modules and the server action (`Effect.runPromise(subscribe(form.get('email')).pipe(Effect.provide(layer)))`, layer chosen from env).
- [ ] **Step 4:** `pnpm test signup` → PASS.
- [ ] **Step 5: Write `e2e/signup.spec.ts`** (dev server runs with `SIGNUP_DRY_RUN=1`): hero form submit valid email → `You're on the list. Talk soon.` visible; double-click submit sends exactly one POST (count requests to the page's server-action endpoint); invalid email → form stays, message announced; notice text visible under both buttons.
- [ ] **Step 6:** `pnpm e2e signup` → PASS. Commit `feat: resend signup via effect server action`.

### Task 5: Story position + scene state (pure)

**Files:**
- Create: `src/story/position.ts`, `src/story/scene-state.ts`, `src/story/keyframes.ts`, `src/story/position.test.ts`, `src/story/scene-state.test.ts`

**Interfaces:**
- Consumes: `BEATS`, `BeatId` (Task 3)
- Produces:
  ```ts
  // position.ts
  export type StoryPosition = number // beatIndex + progress-in-beat, 0 … BEATS.length
  export function positionFromProgress(beatIndex: number, progress: number): StoryPosition // clamps progress 0..1
  export function beatAt(p: StoryPosition): { id: BeatId; t: number }
  export function damp(current: number, target: number, lambda: number, dt: number): number // exponential, frame-rate independent
  // scene-state.ts
  export type Vec3 = readonly [number, number, number]
  export type Framing = 'landscape' | 'portrait'
  export type BatteryVariant = 'none' | 'b-mount' | 'v-mount' | 'a-mount' | 'power-tool'
  export type PartId = 'side-left'|'side-right'|'body'|'control-head'|'front-lid'|'top-deck'|'rear-lid'|'handle'|'handle-knob'
    |'front-door'|'cup-tray'|'drip-grate'|'cup-rest'|'b-mount'|'battery'|'dc-port'|'modular-port'
    |'reservoir'|'pump'|'boiler'|'basket'|'group'|'board'
  export interface SceneState {
    camera: { position: Vec3; target: Vec3; fov: number }
    machineYaw: number            // radians
    paper: number                 // 0 dark bg … 1 blueprint paper bg
    blueprint: number             // 0 shaded … 1 hidden-line drawing
    xray: number                  // 0 solid shell … 1 ghosted shell
    callouts: number              // blueprint label visibility 0..1
    explode: number               // 0..1
    trayOpen: number              // 0 closed … 1 folded down
    batteryAttach: number         // 0 detached (behind, offset 0.4 machine depths) … 1 seated
    battery: BatteryVariant       // discrete
    highlight: PartId | null      // discrete
    boilerGlow: number            // 0..1
    panelLights: number           // 0..4 indicators lit in order POWER, BREWING, BOILER, STEAM
    handleLift: number            // 0 resting … 1 lifted (used in hero idle)
  }
  export function sceneStateAt(p: StoryPosition, framing: Framing): SceneState
  export function lerpState(a: SceneState, b: SceneState, k: number): SceneState // discrete fields switch at k >= 0.5
  ```
  Keyframes (`keyframes.ts`): `{ at: StoryPosition; state: SceneState }[]` per framing, interpolated with smoothstep between neighbours. Pin these beats (landscape; portrait uses the same values except camera pulled back ~1.35× and target shifted so the machine sits in the top 55% of the screen):
  - hero 0–1: 3/4 front-left view matching their render (machine yaw ≈ -0.6), paper 0, trayOpen 0, battery 'b-mount' attach 1 (hidden from this angle)
  - specs 1–2: by 1.15 paper=1, blueprint=1; callouts 0→1 over 1.15–1.4; slow yaw sweep; callouts →0 by 1.9; by 2.0 paper=0, blueprint=0
  - pressure 2–3: xray 1 by 2.2, highlight 'pump', camera closer
  - temperature 3–4: highlight 'boiler', boilerGlow 0→1 over 3.1–3.5
  - control 4–5: xray →0 by 4.1, camera to front panel, panelLights 0→4 over 4.2–4.8, highlight 'modular-port' at 4.8–5.0
  - power 5–6: yaw to show back by 5.2; batteryAttach 0→1 over 5.2–5.4 with battery 'b-mount'; 5.5 'v-mount', 5.7 'a-mount', 5.85 'power-tool' (each detaches→attaches within its slot)
  - repair 6–7: paper/blueprint 1 by 6.1; explode 0→1 over 6.15–6.6; hold; explode →0 over 6.8–6.95; paper/blueprint 0 by 7.0
  - lab 7–8: trayOpen 0→1 over 7.2–7.6, front 3/4 view
  - quote 8–9: camera pulled back, machine small, trayOpen 1
  - cta 9–10: hero angle, trayOpen 1, battery 'b-mount'

- [ ] **Step 1: Write tests:**
  - `beatAt(0)` → `{id:'hero',t:0}`; `beatAt(5.5)` → `{id:'power',t:0.5}`; `beatAt(99)` → `{id:'cta',t:1}`; `beatAt(-1)` → hero t 0
  - `damp(0,1,8,1/60)` between 0 and 1; `damp(0,1,8,10) ≈ 1`; same result for one 1/30 step vs two 1/60 steps (±1e-6)
  - `sceneStateAt(1.5,'landscape')`: paper 1, blueprint 1, callouts 1; `(2.5)`: xray 1, highlight 'pump'; `(3.6)`: boilerGlow 1; `(4.9)`: panelLights 4; `(5.3)`: battery 'b-mount'; `(5.75)`: 'a-mount'; `(6.4)`: explode ≥ 0.9; `(7.0)`: explode 0, paper 0; `(7.7)`: trayOpen 1; `(0.2)`: trayOpen 0
  - **Continuity:** sampling p from 0 to 10 in steps of 0.005, every numeric field changes by < 0.12 per step and camera position by < 0.05 machine-heights per step (no jumps), both framings
  - **Never-invent guard:** `highlight` values ⊂ `['pump','boiler','basket','modular-port','b-mount','dc-port', null]`
- [ ] **Step 2:** `pnpm test story` → FAIL.
- [ ] **Step 3:** Implement. Keyframe times may be tuned in Task 11 but the tests above must keep passing.
- [ ] **Step 4:** `pnpm test story` → PASS. Commit `feat: story position and scene state keyframes`.

### Task 6: Scroll driver, store, text reveals, progress rail

**Files:**
- Create: `src/story/store.ts`, `src/story/use-story-scroll.ts`, `src/components/chrome/ProgressRail.tsx`, `e2e/scroll.spec.ts`
- Modify: `src/app/page.tsx`, `Section.tsx`

**Interfaces:**
- Consumes: `BEATS`, `positionFromProgress`, `beatAt`
- Produces:
  ```ts
  export const story: { get(): StoryPosition; set(p: StoryPosition): void; subscribe(fn: () => void): () => void }
  export function useStoryPosition(): StoryPosition       // useSyncExternalStore; for DOM only, 3D reads story.get() in useFrame
  export function useStoryScroll(): void                   // mounted once in page; one anime.js onScroll per section:
  // onScroll({ target: sectionEl, enter: 'top top', leave: 'bottom bottom', onUpdate: obs => story.set(positionFromProgress(i, obs.progress)) })
  // re-run anime's refresh on resize/orientationchange; sets initial value from current scrollY on mount
  ```
  In non-production builds expose `window.__volta = { story }` for tests. Text reveal per section: anime.js timeline (kicker → headline lines → body → meta, `stagger(60)`, translateY 16px→0 + opacity, `ease: 'out(3)'`, 600ms) triggered once on enter, reversed on leave-backward; reduced motion → no animation, text visible. ProgressRail: fixed bottom-right (desktop) / top thin bar (mobile), 6 segments for 01–06, active segment copper, visible from end of hero to start of cta.

- [ ] **Step 1: Write `e2e/scroll.spec.ts`:**
  - scroll to `#power` top + 50% of its height → `__volta.story.get()` within 5.4–5.6
  - **anchor jump:** from top, click header CTA → within 1500 ms `beatAt(story.get()).id === 'cta'`
  - **reload mid-page:** scroll to `#power`, `page.reload()` → after load `beatAt(story.get()).id === 'power'`
  - **resize:** at `#temperature` middle, `setViewportSize` 1440×900 → 900×1440 → beat id still `'temperature'`
  - progress rail: hidden at top, visible in `#pressure`, segment 01 active
- [ ] **Step 2:** `pnpm e2e scroll` → FAIL. **Step 3:** Implement. **Step 4:** `pnpm e2e scroll` → PASS both projects.
- [ ] **Step 5:** Commit `feat: anime.js scroll driver, story store, reveals, progress rail`.

### Task 7: Machine model — exterior, power, internals (procedural)

**Files:**
- Create: `src/three/machine/{dimensions.ts,parts.ts,parts.test.ts,materials.ts,Machine.tsx}`, `exterior/{SidePlates,Body,ControlHead,TopDeck,Handle,FrontDoor,CupTray}.tsx`, `power/{BMount,Battery,Adapters,DcPort}.tsx`, `internals/{Reservoir,Pump,Boiler,Group,Board}.tsx`, `src/app/lab/page.tsx`
- Consumes: `PartId`, `SceneState`, `Framing`, `Vec3` from `src/story/scene-state.ts` (Task 5)

**Interfaces:**
- Produces:
  ```ts
  // dimensions.ts — unit: 1 = machine height
  export const DIM = { width: 0.38, height: 1, depth: 1.1, plate: 0.012, ... } // tune visually; ratios are estimates
  // parts.ts
  export interface PartDef { id: PartId; group: 'exterior'|'power'|'internal'; explode: Vec3; label: string | null }
  export const PARTS: readonly PartDef[]
  // Machine.tsx
  export function Machine(props: { state: SceneState; framing: Framing }): JSX.Element
  ```
  Reference for every exterior detail: spec "The 3D model" section, `docs/research/volta-site/reveal-video-sheet.png`, `screenshot-1-hero.png`, `screenshot-4-control.png`, `volta-ui.webp`, `docs/research/photos/*`. B-mount plate flat on the back face; battery is a separate rounded block with a teal-grey body. Panel: four indicator dots (green, violet, red, red) with labels POWER / BREWING / BOILER / STEAM as CanvasTexture text in Martian Mono, three buttons (power, cup, steam glyphs). "VOLTA" engraving on lower front. Front door hinges at its bottom edge; tray = door inner face + perforated grate (instanced holes) + wire cup rest. Handle bar pivots on copper knob at upper back. No steam wand.
  Labels allowed (blueprint callouts and exploded view): `PUMP`, `BOILER`, `49 MM BASKET`, `B-MOUNT`, `DC PORT`, `MODULAR PORT, TOP`, and the four spec values `12 BAR`, `±0.5 °C`, `49 MM`, `ANY`; repair rows text (`METRIC TORX + HEX`, `FREE · ONLINE`, `EVERY PART`, `AUSTRIA`) are shown as DOM rows, not part labels.
  `/lab` (dev only): orbit controls, sliders for every numeric SceneState field, dropdowns for discrete ones, toggles for groups.

- [ ] **Step 1: Write `parts.test.ts`:** ids unique; every `PartId` in the union appears in `PARTS`; every explode vector has length > 0 except `body` (the anchor); every non-null label is in the allowed list above; no part id or label contains `wand` or `steam`.
- [ ] **Step 2:** `pnpm test parts` → FAIL. **Step 3:** Implement registry, dimensions, parts, shaded materials (matte black plates, brushed aluminium `MeshPhysicalMaterial` roughness ~0.35 with anisotropy, copper `#BB6622` metalness 1 roughness 0.3), and `/lab`. **Step 4:** `pnpm test parts` → PASS.
- [ ] **Step 5: Fidelity check:** in `/lab` set camera to the hero render angle on a `#9a9a9a` background, screenshot at 1084×1080, place next to frame 1 and frame 8 of `volta-reveal.mp4` (`ffmpeg -ss 0 -frames:v 1` / `-sseof -0.1`) in a `montage` and compare silhouette, proportions, part positions. Adjust `DIM` until outlines agree by eye; record the final ratios in a comment in `dimensions.ts`. Expected: a reviewer comparing the montage identifies the same parts in the same places.
- [ ] **Step 6:** Commit `feat: procedural volta machine model with part registry and lab`.

### Task 8: Render modes — blueprint, x-ray, highlight, callouts

**Files:**
- Create: `src/three/machine/Callouts.tsx`, `src/three/machine/modes.test.ts`
- Modify: `materials.ts`, `Machine.tsx`

**Interfaces:**
- Consumes: `SceneState.{blueprint,xray,highlight,callouts,boilerGlow,panelLights}`, `PARTS`
- Produces: `export function applyModes(materials: MachineMaterials, s: Pick<SceneState,'blueprint'|'xray'|'highlight'|'boilerGlow'|'panelLights'>, part: PartId): MaterialParams` (pure: returns opacity, color, edge opacity, emissive per part) — tested; components only apply its output.
  Blueprint: fills fade to `--paper` white-ish (`#F2F0EE`), drei `<Edges threshold={20}>` lines in `--ink`, edge opacity = blueprint. X-ray: exterior opacity `1 - 0.85·xray`, depthWrite off when transparent, internals visible only when xray > 0 or explode > 0; highlighted part emissive copper. Callouts: drei `<Html>` mono labels with SVG leader lines anchored to part centers, staggered fade by index (`callouts * 4 - index` clamped), positions per framing.

- [ ] **Step 1: Write `modes.test.ts`:** blueprint 1 → exterior edgeOpacity 1, fill color paper; xray 1 → `body` opacity ≤ 0.15 and `pump` opacity 1; xray 0 & explode 0 → internal parts `visible: false`; highlight 'boiler' with boilerGlow 1 → boiler emissiveIntensity > 0, others 0; panelLights 2 → indicators 0,1 lit, 2,3 dark.
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** PASS (`pnpm test modes`).
- [ ] **Step 5:** In `/lab`, screenshot blueprint=1 next to `docs/research/animejs/sheet-blueprint.jpeg` and check the look reads as hidden-line drawing (no shading, consistent line weight). Commit `feat: blueprint, x-ray and callout render modes`.

### Task 9: Charts and DOM sync

**Files:**
- Create: `src/components/charts/{chart-data.ts,PressureChart.tsx,TemperatureChart.tsx,charts.test.ts}`
- Modify: `Pressure.tsx`, `Temperature.tsx`

**Interfaces:**
- Consumes: `useStoryPosition`, `beatAt`
- Produces: `chart-data.ts` exports the exact paths/values from `docs/research/volta-site/chart-pressure.svg` and `chart-temperature.svg` (viewBox `0 0 800 560`, grid y 127/257/387/517 → 12/9/6/3 bar, three curve `d` strings with stroke colors `#5B7A94` dashed `7 8` / `#868B8F` / `#BB6622` 3.5px + end dot; roasts 88.0/92.0/96.0 on 85.0–99.0). `drawAmount(t: number): number` maps the pressure beat's t to 0..1 (flat curve first 0.1–0.6, lever 0.25–0.75, custom 0.4–0.9).
- Pressure chart draws via `pathLength=1` + `strokeDashoffset = 1 - drawAmount`; temperature dots slide from 85.0 to their value over t 0.1–0.6 with `±0.5 °C` hold bar. Reduced motion: fully drawn.

- [ ] **Step 1: Test** `chart-data` values equal those parsed from the two SVG files (read files in test, regex the `d=` attributes and `<text>` values) and `drawAmount` is monotonic, 0 at t=0, 1 at t=1.
- [ ] **Step 2–4:** FAIL → implement → PASS (`pnpm test charts`). **Step 5:** Commit `feat: scroll-drawn pressure and temperature charts`.

### Task 10: Stage — canvas, camera rig, poster, fallbacks

**Files:**
- Create: `src/three/{Stage.tsx,Scene.tsx,CameraRig.tsx}`, `public/media/{poster-hero.webp,poster-hero-mobile.webp}`, `e2e/fallbacks.spec.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `story.get()`, `sceneStateAt`, `damp`, `Machine`
- Produces: `<Stage/>` fixed full-viewport behind sections (`z-0`, sections `z-10`). Inside `useFrame`: `target = sceneStateAt(story.get(), framing)`; displayed state damps toward it per numeric field (`lambda 6` desktop, `5` mobile — the animejs "glide"), discrete fields switch immediately. Background color lerps `--bg` → `--paper` by `paper`; the DOM text color for light beats switches via `data-tone` on `Section` (already from `BEATS.tone`). Framing = `portrait` when `innerHeight > innerWidth`. Hero idle: when p < 0.3 add ±0.06 rad yaw sine (8 s period).
  Poster: extract first frame of `volta-reveal.mp4` (`ffmpeg -ss 0 -i … -frames:v 1`), crop to machine, export WebP desktop + mobile; shown as `next/image` priority behind the canvas until the first frame renders, then fades out over 600 ms. Canvas loads via `next/dynamic(..., { ssr: false })`.
  Fallback rule: if `matchMedia('(prefers-reduced-motion: reduce)')` or WebGL2 unavailable → no canvas; poster stays fixed; sections render normally with text visible.

- [ ] **Step 1: Write `e2e/fallbacks.spec.ts`:**
  - default: `canvas` exists within 8 s and poster opacity reaches 0
  - with `page.addInitScript` overriding `HTMLCanvasElement.prototype.getContext` to return null for `webgl2`/`webgl` → no canvas, poster visible, every headline visible when scrolled to, hero form submits (dry run)
  - with `reducedMotion: 'reduce'` → no canvas, headlines visible immediately (opacity 1 without waiting)
  - before 3D loads (block `**/*.js` chunks of three for 3 s via `page.route` delay) → poster visible at t=500 ms (no blank hero)
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** `pnpm e2e fallbacks` PASS both projects.
- [ ] **Step 5:** Commit `feat: 3d stage with damped camera rig, poster and fallbacks`.

### Task 11: Whole-journey tuning on both framings + performance

**Files:**
- Modify: `src/story/keyframes.ts`, `src/three/**`, section layouts as needed
- Create: `e2e/journey.spec.ts`

- [ ] **Step 1: Write `e2e/journey.spec.ts`:** at the middle of each beat, wait 1.2 s (damping settles), screenshot to `test-results/journey/<project>-<beat>.png`; assert no console errors and that text panel bounding boxes don't extend past the viewport.
- [ ] **Step 2:** Run it, `montage` the screenshots per project, review against the spec's journey table: each beat shows the stated machine action; on mobile the machine sits in the top ~55% and the text panel stays readable (contrast of text vs panel background ≥ 4.5:1 sampled from the screenshot). Tune keyframes/framing until every beat matches. Story unit tests must still pass.
- [ ] **Step 3: Performance:** Chrome DevTools performance trace scrolling hero→cta at 390×844 with 4× CPU throttle: no long task > 100 ms after load, median frame ≤ 20 ms; Lighthouse mobile: LCP ≤ 2.5 s (poster is LCP), CLS ≤ 0.05. Fixes allowed: instancing grate holes, merging static geometry, lower edge thresholds on mobile, `frameloop="demand"` when the damped state has converged.
- [ ] **Step 4:** Commit `perf+polish: tune journey on desktop and mobile`.

### Task 12: Behavior validation against the references

**Files:**
- Create: `docs/research/validation.md`

- [ ] **Step 1:** Using the scroll-behavior-study skill's `probe.mjs` / `compare.mjs`, probe our build at 1440 and 390: pin lengths per beat equal `lengthVh × innerHeight` (±2%), callout labels fade in staggered (first→last spread 100–300 px of scroll), text reveals are triggered-once-per-direction, damping lag present (early ≠ settled sample) and settles within 1.2 s.
- [ ] **Step 2:** Using the animation-behavior-study skill, measure the door fold in `docs/research/volta-site/volta-reveal.mp4` (start/end time, easing curve of the door angle). Map that duration to scroll: the trayOpen ramp in `keyframes.ts` should cover the same proportion of the lab beat as the fold covers in the video's motion, and its easing should be the measured curve (replace smoothstep for `trayOpen` with it).
- [ ] **Step 3:** Write `validation.md` with the numbers and any explained gaps. Re-run `pnpm test && pnpm e2e` → all PASS. Commit `test: behavior validation against animejs study and volta reveal`.

### Task 13: Deploy preview

- [ ] **Step 1:** Ask the user before creating anything on Vercel. With approval: link the repo as a Vercel project, set `RESEND_API_KEY`, `RESEND_SEGMENT_ID` (user provides), deploy a preview.
- [ ] **Step 2:** On the preview URL: response has `x-robots-tag`/meta `noindex`; submit a real test address the user chooses → appears in the Resend segment; run `pnpm e2e` against the preview (`BASE_URL=<url>`) → PASS.
- [ ] **Step 3:** Report the URL. Pushing to GitHub (public) also waits for the user's go-ahead.
