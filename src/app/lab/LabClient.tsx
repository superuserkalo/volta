"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { BEATS } from "@/story/beats";
import { sceneStateAt, type BatteryVariant, type Highlight, type SceneState } from "@/story/scene-state";

const Scene = dynamic(() => import("@/three/Scene"), { ssr: false });

const SLIDERS = [
  ["machineYaw", -3.2, 3.2],
  ["paper", 0, 1],
  ["blueprint", 0, 1],
  ["xray", 0, 1],
  ["callouts", 0, 1],
  ["explode", 0, 1],
  ["trayOpen", 0, 1],
  ["batteryAttach", 0, 1],
  ["boilerGlow", 0, 1],
  ["panelLights", 0, 4],
] as const;

/** Dev-only model viewer: scrub the story or override any scene parameter. */
export function LabClient() {
  const [p, setP] = useState(0);
  const [override, setOverride] = useState<Partial<SceneState>>({});
  const ref = useRef({ p, override });
  ref.current = { p, override };
  const initial = sceneStateAt(0, "landscape");

  return (
    <div className="fixed inset-0" ref={(el) => { if (el && location.search.includes("clean")) el.classList.add("lab-clean"); }}>
      <Scene
        initial={initial}
        lambda={12}
        source={(framing, aspect) => ({ ...sceneStateAt(ref.current.p, framing, aspect), ...ref.current.override })}
      />
      <div className="absolute top-3 left-3 max-h-[95vh] w-72 [.lab-clean_&]:opacity-0 overflow-auto rounded-md bg-black/70 p-3 font-mono text-[11px] text-white">
        <label className="block">
          story p {p.toFixed(3)}
          <input type="range" min={0} max={BEATS.length} step={0.001} value={p} onChange={(e) => setP(+e.target.value)} className="w-full" data-lab="p" />
        </label>
        <button className="mt-1 underline" onClick={() => setOverride({})}>clear overrides</button>
        {SLIDERS.map(([k, min, max]) => (
          <label key={k} className="mt-1 block">
            {k} {override[k] !== undefined ? (override[k] as number).toFixed(2) : "–"}
            <input
              type="range"
              min={min}
              max={max}
              step={0.001}
              value={(override[k] as number | undefined) ?? (sceneStateAt(p, "landscape")[k] as number)}
              onChange={(e) => setOverride((o) => ({ ...o, [k]: +e.target.value }))}
              className="w-full"
              data-lab={k}
            />
          </label>
        ))}
        <label className="mt-1 block">
          battery
          <select className="ml-2 text-black" onChange={(e) => setOverride((o) => ({ ...o, battery: e.target.value as BatteryVariant }))}>
            {["b-mount", "v-mount", "a-mount", "power-tool", "none"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="mt-1 block">
          highlight
          <select className="ml-2 text-black" onChange={(e) => setOverride((o) => ({ ...o, highlight: (e.target.value || null) as Highlight }))}>
            {["", "pump", "boiler", "basket", "modular-port", "b-mount", "dc-port"].map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
