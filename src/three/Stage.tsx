"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { sceneStateAt } from "@/story/scene-state";
import { story } from "@/story/store";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Mode = "pending" | "3d" | "static";

function detectMode(): Mode {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    return gl ? "3d" : "static";
  } catch {
    return "static";
  }
}

/** Idle sway in the hero so the machine feels alive before the first scroll. */
const IDLE_UNTIL = 0.3;

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
      {mode === "3d" && (
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <Scene
            initial={sceneStateAt(story.get(), mobile ? "portrait" : "landscape")}
            lambda={mobile ? 5 : 6}
            dprMax={mobile ? 1.5 : 2}
            onReady={() => setReady(true)}
            source={(framing, aspect, t) => {
              const p = story.get();
              const s = sceneStateAt(p, framing, aspect);
              if (p < IDLE_UNTIL) s.machineYaw += Math.sin((t / 8) * Math.PI * 2) * 0.06 * (1 - p / IDLE_UNTIL);
              return s;
            }}
          />
        </div>
      )}
    </div>
  );
}
