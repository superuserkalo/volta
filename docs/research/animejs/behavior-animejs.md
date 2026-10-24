# animejs.com scroll behavior (captured 2026-10-24)

Stack seen: three.js r172 (`canvas#renderer[data-engine="three.js r172"]`, WebGL2, DPR 2) + CSS3DRenderer overlay (`#css-renderer`) for in-scene labels; anime.js v4 drives scroll (`window.AnimeJS`). No GSAP ScrollTrigger, no Lenis, no CSS scroll-driven animations. The "engine" is split into ~22 separate GLB parts (`/assets/models/module-*.glb`), which is what makes the exploded view possible.

Architecture: one fixed full-viewport WebGL stage (`#engine`, PIN 0–20240 at both widths). Sections are tall scroll spacers; their text layers are `position:fixed` and cross-fade in/out. Every transform shows LAG (early sample ≠ settled sample) → scroll-linked but **damped/lerped** toward the scroll target, so motion keeps gliding a beat after the wheel stops. Same journey at 390px (page 20.2k vs 21.1k), not a reduced fallback.

## 1. Hero → engine reveal (y 0–1760, ~2 viewports)
- y0: dark bg, hero ring (colored arc segments) with demo inside, headline left.
- 0–330: header links drift (ty 0→108) and fade; progress card slides in at 330–440 (ty 40→0, op 0→1) and stays pinned until 19,800.
- 550–770: ring fades (op 1→0) while the 3D engine assembles/rotates into view, dark metallic shading.
- Scroll-linked, damped. Easing between thresholds ≈ ease-in-out.

## 2. Blueprint section "toolbox" (section 2700–6300, pinned 3600px = 4 viewports)
- 1760–1870: light section fades in fast (op 0→1 over ~110px), a hard style switch: the same model re-renders as **hidden-line technical drawing** (dark line art on warm grey #d9d6d3-ish).
- 1650–2420: 11 callout labels (left/right columns, mono, tiny) fade in staggered by ~50–100px; leader polylines draw from labels to parts of the model (polyline geometry animates, HYST = differs up vs down).
- 2400–5000: model slowly rotates/dollies along its axis while pinned; labels stay.
- 3740–4840: labels fade out staggered.
- 5000–5390: camera pushes toward the front lens; section fades out (op 1→0) at 5280–5390, back to dark shaded render, engine end becomes the ring.

## 3. Feature gallery (6300–14400, 9 × 900px)
- The ring (`div.output`) pins (6380–13750 @ top 96). Each feature = exactly 900px of scroll: demo inside ring cross-fades in 110px (op 0→1), holds ~770px, cross-fades out.
- Left: colored feature title + body + 3 mono bullets; right-bottom: code card. Each feature has its own accent color.
- Demos inside are themselves scroll-scrubbed (e.g. playhead rot 0→-140→0 across 11660–12650, shapes tx/ty in 12760–13310).

## 4. Exploded modular view (section 14400–18000, pinned 3600px)
- 13860–14630: ring shrinks/fades, engine returns shaded (dark) at 14400.
- 14410–14520: switch to light blueprint again.
- 14800–16400: parts **fly apart along their own axes** (exploded view), each with a small colored dot + mono size label ("5.44 KB"); a "Bundle size" card bottom-right counts down 27.13 → 11.38 KB as parts detach/disappear.
- 16390–16500: fades back to dark.

## 5. Sponsors + footer (18000–21142)
- Ring returns (17050–17490 op →1), heart demo, then normal-flow footer with grid of doc links + email subscribe.

## Persistent chrome
- Bottom-right progress card (segmented tick bar, active segment red) pinned 440–19,800.

## Reduced motion
Not verified (not toggled in this capture).

## Frames
out/anime-1440/sheet-journey.jpeg, sheet-blueprint.jpeg, sheet-explode.jpeg

## Not done in this pass
Step 7 prototype + probe compare skipped: this was recon during brainstorming. It will be done against the real Volta build (probe the pinned stage, label stagger and explode timings).
