"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { PartId, SceneState } from "@/story/scene-state";
import { useSceneStateRef } from "./context";
import { partDef } from "./parts";

type V3 = [number, number, number];

interface Callout {
  /** Big text (a spec value) and small text (the part it belongs to). Both from VOLTA's copy. */
  value: string;
  part: string;
  /** Point on the machine, machine-local (before yaw). */
  anchor: V3;
  /** The part the anchor belongs to, so it follows the exploded view. */
  partId: PartId;
  /** Where the label sits relative to the anchor, in world units. */
  offset: V3;
  /** Which scene value shows this callout. */
  show: (s: SceneState, index: number) => number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const stagger = (v: number, i: number, n: number) => clamp01((v * (n + 1) - i) / 1.4);

const SPEC_CALLOUTS: Callout[] = [
  { value: "12 BAR", part: "PUMP", partId: "pump", anchor: [0, 0.24, -0.2], offset: [-0.55, -0.12, 0.2], show: (s, i) => stagger(s.callouts, i, 4) },
  { value: "±0.5 °C", part: "BOILER", partId: "boiler", anchor: [0.03, 0.66, 0], offset: [-0.5, 0.32, 0.2], show: (s, i) => stagger(s.callouts, i, 4) },
  { value: "49 MM", part: "49 MM BASKET", partId: "basket", anchor: [0, 0.585, 0.3], offset: [0.5, 0.3, 0.2], show: (s, i) => stagger(s.callouts, i, 4) },
  { value: "ANY", part: "B-MOUNT", partId: "b-mount", anchor: [0, 0.36, -0.48], offset: [0.55, -0.2, 0.2], show: (s, i) => stagger(s.callouts, i, 4) },
];

const explodeShow = (s: SceneState, i: number) => clamp01((s.explode - 0.55 - i * 0.05) / 0.25) * s.blueprint;
const PART_CALLOUTS: Callout[] = [
  { value: "", part: "MODULAR PORT, TOP", partId: "modular-port", anchor: [0, 0.99, 0.35], offset: [0.25, 0.22, 0], show: explodeShow },
  { value: "", part: "BOILER", partId: "boiler", anchor: [0.1, 0.66, 0], offset: [0.3, 0.16, 0], show: explodeShow },
  { value: "", part: "PUMP", partId: "pump", anchor: [-0.08, 0.24, -0.2], offset: [-0.3, -0.12, 0], show: explodeShow },
  { value: "", part: "49 MM BASKET", partId: "basket", anchor: [0, 0.56, 0.3], offset: [0.3, -0.16, 0], show: explodeShow },
  { value: "", part: "B-MOUNT", partId: "b-mount", anchor: [0, 0.5, -0.48], offset: [-0.3, 0.2, 0], show: explodeShow },
  { value: "", part: "DC PORT", partId: "dc-port", anchor: [0.11, 0.8, -0.48], offset: [0.28, 0.12, 0], show: explodeShow },
];

function CalloutView({ c, index }: { c: Callout; index: number }) {
  const state = useSceneStateRef();
  const { gl, camera, size } = useThree();
  const el = useRef<HTMLDivElement | null>(null);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
    const m = new THREE.LineBasicMaterial({ color: "#2a2c2e", transparent: true, opacity: 0, depthTest: false });
    const l = new THREE.Line(g, m);
    l.renderOrder = 5;
    l.frustumCulled = false;
    return l;
  }, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const leftSide = c.offset[0] < 0;

  // Labels are plain DOM over the canvas (crisp text, no extra React roots).
  useEffect(() => {
    const host = gl.domElement.parentElement;
    if (!host) return;
    const div = document.createElement("div");
    div.setAttribute("aria-hidden", "true");
    div.className = "pointer-events-none absolute top-0 left-0 font-mono whitespace-nowrap text-ink";
    div.style.opacity = "0";
    div.style.willChange = "transform, opacity";
    div.innerHTML =
      (c.value ? `<div class="text-[13px] leading-none tracking-tight md:text-[17px]">${c.value}</div>` : "") +
      `<div class="mt-1 text-[8px] tracking-[0.14em] opacity-60 md:text-[9px]">${c.part}</div>`;
    host.appendChild(div);
    el.current = div;
    return () => {
      div.remove();
      el.current = null;
    };
  }, [gl, c.value, c.part]);

  useFrame(() => {
    const s = state.current;
    const o = c.show(s, index);
    const ex = partDef(c.partId).explode;
    tmp.set(c.anchor[0] + ex[0] * s.explode, c.anchor[1] + ex[1] * s.explode, c.anchor[2] + ex[2] * s.explode);
    tmp.applyAxisAngle(THREE.Object3D.DEFAULT_UP, s.machineYaw);
    const a = tmp;
    const bx = a.x + c.offset[0], by = a.y + c.offset[1], bz = a.z + c.offset[2];
    // elbow leader line that grows out of the part, like a technical drawing
    const pos = line.geometry.attributes.position as THREE.BufferAttribute;
    const grow = clamp01(o * 1.6);
    const ex1 = a.x + (bx - a.x) * 0.25 * grow, ey1 = a.y + (by - a.y) * grow, ez1 = a.z + (bz - a.z) * 0.25 * grow;
    pos.setXYZ(0, a.x, a.y, a.z);
    pos.setXYZ(1, ex1, ey1, ez1);
    pos.setXYZ(2, ex1 + (bx - ex1) * grow, ey1 + (by - ey1) * grow, ez1 + (bz - ez1) * grow);
    pos.needsUpdate = true;
    (line.material as THREE.LineBasicMaterial).opacity = o * 0.9;
    line.visible = o > 0.01;

    const div = el.current;
    if (!div) return;
    const vis = clamp01((o - 0.35) / 0.65);
    div.style.opacity = String(vis);
    if (vis <= 0) return;
    proj.set(bx, by, bz).project(camera);
    const x = (proj.x * 0.5 + 0.5) * size.width;
    const y = (-proj.y * 0.5 + 0.5) * size.height;
    const shiftX = leftSide ? "calc(-100% - 8px)" : "8px";
    div.style.transform = `translate(${x}px, ${y}px) translate(${shiftX}, -50%) translateY(${(1 - vis) * 6}px)`;
  });

  return <primitive object={line} />;
}

/** Blueprint labels: spec values in the specs beat, part names in the exploded view. */
export function Callouts() {
  return (
    <>
      {SPEC_CALLOUTS.map((c, i) => (
        <CalloutView key={`s${i}`} c={c} index={i} />
      ))}
      {PART_CALLOUTS.map((c, i) => (
        <CalloutView key={`p${i}`} c={c} index={i} />
      ))}
    </>
  );
}
