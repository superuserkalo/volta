"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { sceneStateAt } from "@/story/scene-state";
import { story } from "@/story/store";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Mode = "pending" | "3d" | "static";

/**
 * True once after the story jumps instead of scrolling (reload restoring the
 * scroll, an anchor link, a drag of the scrollbar): the stage then cuts to the
 * new shot instead of flying the machine across whatever is on screen.
 */
let lastP = -1;
function jumped() {
  const p = story.get();
  const cut = lastP < 0 || Math.abs(p - lastP) > 0.5;
  lastP = p;
  return cut;
}

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
    setMobile(window.innerWidth < 768);
    document.documentElement.classList.toggle("no-3d", m === "static");
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
            initial={sceneStateAt(story.get(), mobile ? "portrait" : "landscape")}
            lambda={mobile ? 5 : 6}
            dprMax={mobile ? 1.5 : 2}
            onReady={() => setReady(true)}
            source={(framing, aspect) => sceneStateAt(story.get(), framing, aspect)}
            cut={jumped}
          />
        </div>
      )}
    </div>
  );
}
