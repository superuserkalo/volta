"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { BatteryVariant } from "@/story/scene-state";
import { useSceneStateRef } from "./context";
import { DIM } from "./dimensions";
import { Part } from "./Part";
import { Block, Cyl } from "./shapes";

const MOUNT_Z = DIM.back - 0.006; // back face of the native B-mount plate
const ease = (k: number) => k * k * (3 - 2 * k);
/** Share of the attach travel spent coming in; the rest is the drop into the lock. */
const LOCK_AT = 0.68;

/** Shapes are generic silhouettes of each battery standard, never a specific brand's pack. */
function Variant({ kind }: { kind: Exclude<BatteryVariant, "none"> }) {
  switch (kind) {
    case "b-mount":
      return (
        <>
          <Block kind="battery" size={[0.25, 0.4, 0.15]} position={[0, 0, -0.075]} radius={0.016} />
          <Block kind="battery-label" size={[0.252, 0.04, 0.12]} position={[0, 0.165, -0.08]} radius={0.006} />
          <Block kind="dark" size={[0.12, 0.02, 0.012]} position={[0, -0.12, -0.152]} radius={0.004} />
        </>
      );
    case "v-mount":
      return (
        <>
          <Block kind="dark" size={[0.23, 0.34, 0.022]} position={[0, 0, -0.011]} radius={0.006} />
          <Block kind="battery" size={[0.2, 0.28, 0.085]} position={[0, -0.01, -0.065]} radius={0.024} />
          <Block kind="battery-label" size={[0.15, 0.03, 0.002]} position={[0, 0.08, -0.108]} radius={0.001} />
        </>
      );
    case "a-mount":
      return (
        <>
          <Block kind="dark" size={[0.23, 0.34, 0.022]} position={[0, 0, -0.011]} radius={0.006} />
          <Block kind="battery" size={[0.21, 0.26, 0.105]} position={[0, -0.02, -0.074]} radius={0.01} />
          <Block kind="copper" size={[0.13, 0.012, 0.004]} position={[0, 0.085, -0.127]} radius={0.002} />
        </>
      );
    case "power-tool":
      return (
        <>
          <Block kind="dark" size={[0.2, 0.26, 0.05]} position={[0, 0.03, -0.025]} radius={0.01} />
          <Block kind="rubber" size={[0.08, 0.2, 0.02]} position={[0, 0.03, -0.06]} radius={0.004} />
          <Block kind="battery" size={[0.15, 0.13, 0.17]} position={[0, -0.06, -0.135]} radius={0.014} />
          <Block kind="battery-label" size={[0.152, 0.025, 0.12]} position={[0, -0.01, -0.14]} radius={0.004} />
        </>
      );
  }
}

const VARIANTS = ["b-mount", "v-mount", "a-mount", "power-tool"] as const;

export function Power() {
  const state = useSceneStateRef();
  const slider = useRef<THREE.Group>(null);
  const variants = useRef<Record<string, THREE.Group | null>>({});
  useFrame(() => {
    const s = state.current;
    // Like a real plate mount: the pack comes straight in against the back, then drops down and locks.
    const a = Math.min(1, Math.max(0, s.batteryAttach));
    const approach = 1 - ease(Math.min(1, a / LOCK_AT));
    const lock = a <= LOCK_AT ? 0 : ((a - LOCK_AT) / (1 - LOCK_AT)) ** 2;
    if (slider.current) slider.current.position.set(0, 0.36 + (1 - lock) * 0.07, MOUNT_Z - 0.004 - approach * 0.32);
    for (const v of VARIANTS) {
      const g = variants.current[v];
      if (g) g.visible = s.battery === v;
    }
  });
  return (
    <>
      <Part id="b-mount">
        <Block kind="dark" size={[0.24, 0.36, 0.01]} position={[0, 0.36, MOUNT_Z + 0.001]} radius={0.004} />
        {[-1, 1].map((s) => (
          <Block key={s} kind="steel" size={[0.016, 0.3, 0.008]} position={[s * 0.095, 0.37, MOUNT_Z - 0.006]} radius={0.002} />
        ))}
        <Block kind="copper" size={[0.05, 0.03, 0.008]} position={[0, 0.2, MOUNT_Z - 0.006]} radius={0.002} />
      </Part>
      <Part id="dc-port">
        <Cyl kind="dark" radius={0.018} length={0.016} axis="z" position={[0.11, 0.8, DIM.back - 0.008]} segments={24} />
        <Cyl kind="copper" radius={0.008} length={0.018} axis="z" position={[0.11, 0.8, DIM.back - 0.009]} segments={16} />
      </Part>
      <group ref={slider}>
        <Part id="battery">
          {VARIANTS.map((v) => (
            <group key={v} ref={(g) => { variants.current[v] = g; }}>
              <Variant kind={v} />
            </group>
          ))}
        </Part>
      </group>
    </>
  );
}
