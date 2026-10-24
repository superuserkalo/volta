# Volta scroll-story site — design

Date: 2026-10-25 · Repo: `superuserkalo/volta` (public, open source)

## Intent

volta.coffee is an Elementor/WordPress landing page for VOLTA, a portable, battery-powered, high-end espresso machine from Austria (Founders Edition, prototype stage). The content is strong; the presentation is a static dark page with a few renders.

This project is an unsolicited, open-source redesign built as a gift to the company: the same page, same words, same facts, retold as one continuous 3D scroll story in the style of animejs.com. The machine is treated like the rocket engine on animejs.com: a precise piece of engineering you orbit, see as a blueprint, look inside, and take apart. Success is a visitor who arrives skeptical ("portable espresso is always a compromise") and reaches the final signup convinced this is serious engineering, then leaves their email.

Secondary goal: show Volta a faster, cheaper, ownable stack than Elementor (Next.js on Vercel).

## Goals

- One fixed 3D model of the VOLTA machine stays on screen from top to bottom and changes per section (rotate, blueprint mode, x-ray, battery swap, explode, tray fold).
- Every word of copy comes verbatim from volta.coffee (see `docs/research/volta-site/copy-verbatim.txt`). Deliberate edit: both "Founders Edition" dates read **Winter 2026** (the site currently says Winter in the hero and Fall at the bottom; the user chose the later date for both), and the matching "ready in the fall" becomes "ready in the winter" (see Builder's calls).
- The 3D exterior is as faithful as possible to Volta's own render/video and the prototype photos.
- Mobile-first: the same journey on a phone, not a reduced fallback. Smooth on a mid-range phone.
- Working email signup (Resend).

## Non-goals

- New marketing copy, new claims, new specs, new sections beyond what volta.coffee has.
- A shop, accounts, CMS, i18n, blog, or the Impressum page itself (footer links to their existing one).
- A photoreal product render. The look is stylized technical precision, closer to animejs.com than to a studio render.

## Anti-goals (failure even if it works)

- **Inventing product facts.** No made-up numbers (part counts, capacities, run times, weights, dimensions), no features shown as finished that the site lists as "in testing" (steam wand, brew to weight) or "planned" (shot logging). The steam wand is not modelled.
- **Presenting guessed internals as real.** The inside of the machine is a plausible illustration. Wherever the internals are visible, Volta's own line "Prototype. Details might change." is shown (verbatim, already on their site).
- **Paraphrased copy.** If a text string isn't in `copy-verbatim.txt`, it doesn't ship, except: the date edits above, accessibility-only text (aria labels, alt text) written plainly from the copy's own nouns, and the unofficial/privacy notices required by the Signup section.
- **Looking like Volta's official site in the wild.** It isn't theirs (see Constraints).
- Scroll-jank, a blank screen while the 3D loads, or unreadable text on mobile.

## Constraints

- Stack (user's): TypeScript, Next.js App Router, Vercel, Tailwind CSS, shadcn/ui, lucide + hugeicons, Resend, Effect. Plus three.js and anime.js v4 for the 3D and scroll motion.
- Brand system taken from the live site: fonts Instrument Sans (UI/headings) and Martian Mono (labels, specs); colors `#131516` / `#1B1E20` backgrounds, `#33373A` lines, `#E9E9E9` text, `#AEB2B5` / `#868B8F` / `#5F6367` secondary greys, `#BB6622` copper accent (`#8A4A17` / `#CC8340` shades), `#5B7A94` custom-curve blue, `#4E8C6A` green (indicator). Logo SVGs in `docs/research/volta-site/logo-volta.svg` and `logo-bean.svg`.
- Brand assets, photos (founder portrait `bene.jpg`), copy and video belong to VOLTA. The repo README must state this is an unofficial concept redesign, not affiliated with or endorsed by VOLTA, and the deployment must be `noindex` until VOLTA adopts it.
- Must respect `prefers-reduced-motion` and work without WebGL.

## Research (in repo)

- `docs/research/volta-site/` — verbatim copy, page HTML, screenshots of every section, reveal video `volta-reveal.mp4` + frame sheet, control-panel image `volta-ui.webp`, founder photo, logo + chart SVGs (`chart-pressure.svg`, `chart-temperature.svg` hold the exact curve paths and scales).
- `docs/research/photos/` — two photos of the physical prototype (front and top-down).
- `docs/research/animejs/behavior-animejs.md` + frame sheets — measured scroll behavior of animejs.com (captured 2026-10-24).
- Current signup posts to MailerLite (`assets.mailerlite.com/jsonp/1924275/forms/192815577519097848/subscribe`).

## The scroll journey (decided with the user)

One fixed full-viewport WebGL stage behind everything. Sections are scroll distance; their text layers fade/slide over the stage. Copy for each beat is the matching block in `copy-verbatim.txt`.

| # | Section (verbatim headline) | What the machine does |
|---|---|---|
| 0 | Hero — "Real espresso. 9 bar. Anywhere." + email form, "Founders Edition · Winter 2026", "Prototype. Details might change." | Dark scene, machine in 3/4 view (matching their render angle), slow idle turn. |
| 1 | Spec strip — 12 BAR / ±0.5 °C / 49 MM / ANY | Switches to **blueprint mode**: light background, hidden-line drawing, mono callout labels with leader lines drawing to the relevant parts (pump/group → 12 BAR, boiler → ±0.5 °C, basket → 49 MM, back battery mount → ANY). Labels fade in staggered. |
| 2 | 01 · Pressure — "Profile the shot, not just pull it." | Back to dark; camera moves in, shell goes x-ray, pump highlighted. The pressure chart (exact paths from `chart-pressure.svg`) draws as you scroll; FLAT / LEVER / CUSTOM. |
| 3 | 02 · Temperature — "Roast-matched, and it holds." | Boiler glows copper; the three roast setpoints (88.0 / 92.0 / 96.0 on an 85.0–99.0 scale) slide into place, values from `chart-temperature.svg`. |
| 4 | 03 · Control — "Simple on the machine. Everything in the app." | Camera to the front panel; POWER / BREWING / BOILER / STEAM indicators and the three buttons light up in sequence. The modular port on top is highlighted for the "Modular port, top" row. |
| 5 | 04 · Power — "One machine. Any battery you own." | Machine turns to show the back; a B-mount battery slides and clicks onto the native mount, DC port highlighted. Then the three cards (Native / V-mount and A-mount / Power-tool packs) each swap in a matching adapter + battery silhouette. |
| 6 | 05 · Built to stay built — "Repairable. Every part replaceable." | **Exploded view**: parts separate along their own axes, light blueprint mode, labels taken only from the four rows (METRIC TORX + HEX, FREE · ONLINE, EVERY PART, AUSTRIA) plus part names that appear in the copy. No counters with invented numbers. |
| 7 | 06 · Built in public — "Still in the lab. Come watch." + four status cards | Parts reassemble; the lower front door folds down into the cup tray (motion matched to their reveal video). |
| 8 | Founder quote (Benedict Heinzl) | Machine recedes, calm; bean mark + quote. |
| 9 | Final CTA — "Be first in line." (date → Winter 2026) + form; footer (Instagram, YouTube, Impressum, © line) | Machine back to hero pose; normal-flow footer. |

Motion feel (from the animejs study): scroll-linked but **damped**, so motion trails the wheel slightly and eases to rest; each pinned beat is a whole number of viewport heights; text cross-fades over ~10–15% of a beat; persistent small progress indicator showing the section numbers 01–06.

## The 3D model

Built in code as separate named parts (needed for x-ray, labels and the exploded view). Exterior sources, in priority order: `volta-reveal.mp4` frames and the hero render (shape, materials, details), the prototype photos (proportions, handle, back), the copy (what exists).

Exterior parts (from references):
- Slim upright box, long front-to-back. Approximate ratio width : height : depth ≈ 0.38 : 1 : 1.1 (**estimate**, tune against the render/video until silhouettes match).
- Two black side plates with corner screws; long vertical slot on the side plate.
- Brushed-aluminium body (front, top, back).
- Front control head, overhanging the top-front with an angled face: four indicators (green POWER, blue/violet BREWING, red BOILER, red STEAM) with printed labels, three buttons (power / cup / steam icons), a copper flip lid over a recessed slot.
- Top deck: second copper lid, open cavity at the back.
- Carry handle: a long bar along the top, pivoting on a copper knob at the upper back.
- Lower front: "VOLTA" engraving; door that folds down into a cup tray with perforated drip grate, copper pull, wire cup rest.
- Back: native B-mount battery plate **flat on the back face** (confirmed by the user) and DC power port (from copy). The B-mount battery itself is modelled as a separate part (the cyan block in the prototype photo).

Internals (illustrative; never presented as real): water reservoir, pump, boiler, 49 mm basket/group, controller board, battery wiring. Placed plausibly for the form factor. Labels on internals only use nouns that appear in Volta's copy (pump, boiler, 49 mm basket, B-mount, DC port, modular port).

Render modes: (a) shaded dark (matte black plates, brushed aluminium, copper accents, soft studio lighting), (b) blueprint (light warm-grey background, white fills, dark edge lines, hidden-line look), (c) x-ray (ghosted shell, highlighted internal part).

## Signup (decided by the user: live, into the user's own Resend account)

Signups are real and land in the project owner's Resend account, not VOLTA's. Because of that, the page must say so plainly:
- Under each form, a short visible line stating that this is an unofficial concept site not affiliated with VOLTA, and that the email is stored by the site's maintainer (not VOLTA) only to notify about VOLTA's launch, with a way to be removed. Exact wording is the builder's, kept short and in the site's mono style.
- The footer repeats the unofficial-concept line next to the © line.
- No pre-ticked boxes; submitting the form is the consent, and the notice sits directly beside the button.

Server Action written with Effect: validate the email with Effect Schema, add the contact to a Resend audience/segment, typed errors for invalid / duplicate / provider failure. UI states use the site's verbatim strings ("Loading…", "You're on the list. Talk soon."). Env: `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`. No email is sent on signup (the copy promises "One email when we launch. Maybe two."). Both forms (hero + final) use the same action.

## Builder's calls (made by Claude, not confirmed by the user — flagged for review)

- **Model is procedural three.js geometry in TypeScript**, not a Blender GLB: no asset pipeline, tiny download, every part addressable for explode/x-ray. Revisit only if fidelity can't get close enough.
- **react-three-fiber + drei** as the three.js layer inside Next.js; **anime.js v4** (`onScroll`/timelines) drives the scroll progress that the scene reads. "vpgu" in the request is read as WebGPU: three.js WebGL2 renderer by default for broad mobile support; WebGPU is not required.
- **Mobile layout**: stage fills the screen; section text sits in a lower panel over a gradient; camera framing per beat is tuned separately for portrait. Device pixel ratio capped (≈1.5 mobile, 2 desktop).
- **Loading**: first paint is the hero text plus a still poster frame taken from `volta-reveal.mp4`; the 3D scene fades in over it when ready. No-WebGL and reduced-motion get static per-section images/posters with all copy in the DOM, no scroll scrubbing.
- **All copy is real DOM text** (SEO, accessibility), never baked into the canvas.
- VOLTA's existing list stays in their MailerLite; if they adopt this site they choose whether to migrate.
- **"ready in the fall" in the final CTA body becomes "ready in the winter"**, following the user's "later date for both" so the page doesn't contradict itself. This is the only other copy edit.
- **Hero pose has the cup-tray door closed** (matches the first frame of their reveal video); beat 7 folds it open; beat 9 returns to the hero angle with the tray open (the reveal's end state, as in their hero render).
- Charts are rebuilt as React SVG from the exact paths in their SVGs so they can animate.
- Validate the built scroll beats with the scroll-behavior-study probes (pins, label stagger, explode timing) and the tray fold-down against their video with animation-behavior-study.

## Left to the builder

Exact scroll lengths per beat, camera paths, damping constants, lighting, material values, component structure, and the precise internal layout, as long as the goals and anti-goals hold.
