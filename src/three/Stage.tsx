"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { damp } from "@/story/position";
import { isPhone } from "@/story/phone";
import { PHONE_ZONE, sceneStateAt, type Zone } from "@/story/scene-state";
import { story } from "@/story/store";
import type { StateSource } from "./Scene";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Mode = "pending" | "3d" | "static";

/**
 * The stage follows a smoothed copy of the scroll position and builds the whole
 * scene from that one value. Every part of a move stays in step: a pack can
 * only swap where the timeline has it fully off, and nothing lags behind on its
 * own. A jump (reload restoring the scroll, an anchor link) is taken at once and
 * the stage cuts to the new shot instead of flying the machine across the page.
 */
const follow = { p: 0, jumps: -1, t: -1, cut: true };

/**
 * Phone: where the machine may sit, in px from the top of the screen — below the
 * header, above the window's fading edge. Measured on layout changes (see Stage).
 */
const phone: { top: number; bottom: number; windowShare?: number[] } = { top: 0, bottom: 0 };
function phoneZone(height: number): Zone {
  if (!phone.bottom || height <= 0) return PHONE_ZONE;
  return { top: phone.top / height, bottom: phone.bottom / height, windowShare: phone.windowShare };
}

function followed(lambda: number): StateSource {
  return (framing, aspect, elapsed, height) => {
    const raw = story.get();
    const dt = follow.t < 0 ? 0 : Math.min(0.1, Math.max(0, elapsed - follow.t));
    follow.t = elapsed;
    follow.cut = follow.jumps !== story.jumps();
    follow.jumps = story.jumps();
    follow.p = follow.cut ? raw : damp(follow.p, raw, lambda, dt);
    return sceneStateAt(follow.p, framing, aspect, phoneZone(height));
  };
}
const jumped = () => follow.cut;

function detectMode(): Mode {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    return gl ? "3d" : "static";
  } catch {
    return "static";
  }
}

/**
 * Fixed full-screen stage behind the page. Shows a still of the hero render
 * until the 3D scene has drawn its first frame; stays a still when motion is
 * reduced or WebGL2 is missing.
 */
export function Stage() {
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const m = detectMode();
    // Browser-only checks (WebGL, reduced motion), so they run after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(m);
    setMobile(isPhone(window.innerWidth));
    document.documentElement.classList.toggle("no-3d", m === "static");
  }, []);

  // Phone framing: the machine sits between the header and the window's fading edge.
  const shield = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const header = document.querySelector("header");
    const sections = [...document.querySelectorAll<HTMLElement>("section[data-beat]")];
    const measure = () => {
      const win = shield.current?.offsetHeight ?? 0;
      phone.top = (header?.offsetHeight ?? 0) + 6;
      phone.bottom = win - 30;
      phone.windowShare = sections.map((s) => win / Math.max(1, s.offsetHeight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (shield.current) ro.observe(shield.current);
    if (header) ro.observe(header);
    sections.forEach((s) => ro.observe(s));
    return () => ro.disconnect();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden data-stage={mode} data-ready={ready}>
      {/* The hero still belongs to the hero: it leaves with the first screen of scroll (CSS, so a
          reload further down never flashes it before the scripts run). */}
      <div className="stage-poster absolute inset-0">
        <picture>
          <source media="(max-width: 767px)" srcSet="/media/poster-hero-mobile.webp" />
          <img
            src="/media/poster-hero.webp"
            alt=""
            data-poster
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: mode === "3d" && ready ? 0 : 1 }}
          />
        </picture>
      </div>
      {mode === "3d" && (
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <Scene
            initial={sceneStateAt(story.get(), mobile ? "portrait" : "landscape", undefined, phoneZone(window.innerHeight))}
            // the smoothing happens on the scroll position (see `followed`), so the stage shows it as is
            lambda={Infinity}
            dprMax={mobile ? 1.5 : 2}
            onReady={() => setReady(true)}
            // tight enough to feel attached to the scroll (~0.1 s), loose enough to hide a mouse wheel's steps
            source={followed(mobile ? 12 : 10)}
            cut={jumped}
          />
        </div>
      )}
      {/* Phone: the machine window catches taps, so they never land on copy that has scrolled under it.
          Dragging on it still scrolls the page. Off once the machine has left (the CTA). */}
      <div ref={shield} className="stage-shield pointer-events-auto absolute inset-x-0 top-0 h-[var(--stage-window)] md:hidden" />
      <div className="stage-edge absolute inset-x-0 top-[calc(var(--stage-window)-2rem)] h-8 bg-linear-to-b from-transparent to-[var(--stage-bg,var(--bg))] md:hidden" />
    </div>
  );
}
