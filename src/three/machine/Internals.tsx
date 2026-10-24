"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useSceneStateRef } from "./context";
import { DIM } from "./dimensions";
import { Part } from "./Part";
import { Block, Cyl, Wire } from "./shapes";

// Illustrative only. VOLTA has not published its internals; these are
// plausible placements for the form factor and are always shown next to
// "Prototype. Details might change."

/** Brew group and 49 mm basket: they live in the head unit and slide out with it. */
export function BrewGroup() {
  return (
    <>
      <Part id="group">
        <Cyl kind="steel" radius={0.08} length={0.07} position={[0, 0.655, 0.3]} />
        <Cyl kind="copper" radius={0.082} length={0.012} position={[0, 0.62, 0.3]} />
      </Part>
      <Part id="basket">
        <Cyl kind="steel" radius={DIM.basketRadius} length={0.05} position={[0, 0.585, 0.3]} open />
        <Cyl kind="steel" radius={DIM.basketRadius * 0.92} length={0.004} position={[0, 0.561, 0.3]} />
        <Cyl kind="steel" radius={DIM.basketRadius + 0.012} length={0.006} position={[0, 0.61, 0.3]} open />
      </Part>
    </>
  );
}

function Tubes() {
  const state = useSceneStateRef();
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const s = state.current;
    const show = s.xray * (s.explode < 0.02 ? 1 : 0) * (1 - s.blueprint);
    if (group.current) group.current.visible = show > 0.01;
    if (mat.current) mat.current.opacity = show;
  });
  const paths: [number, number, number][][] = [
    [[-0.1, 0.56, -0.29], [-0.11, 0.42, -0.25], [-0.06, 0.3, -0.21], [-0.04, 0.26, -0.2]],
    [[0.04, 0.24, -0.2], [0.09, 0.4, -0.16], [0.06, 0.6, -0.12], [0.03, 0.66, -0.12]],
    [[0.03, 0.66, 0.12], [0.02, 0.69, 0.2], [0, 0.69, 0.25]],
  ];
  return (
    <group ref={group}>
      {paths.map((p, i) => (
        <mesh key={i} userData={{ noLook: true }}>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(p.map((v) => new THREE.Vector3(...v))), 40, 0.006, 8, false]} />
          <meshStandardMaterial ref={i === 0 ? mat : undefined} color="#bb6622" metalness={0.8} roughness={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

export function Internals() {
  return (
    <>
      <Part id="reservoir">
        <Block kind="glass" size={[0.29, 0.38, 0.18]} position={[0, 0.6, -0.36]} radius={0.012} />
      </Part>
      <Part id="boiler">
        <Cyl kind="steel" radius={0.066} length={0.24} axis="z" position={[0.03, 0.66, 0]} />
        <Cyl kind="copper" radius={0.068} length={0.016} axis="z" position={[0.03, 0.66, -0.08]} />
        <Cyl kind="copper" radius={0.068} length={0.016} axis="z" position={[0.03, 0.66, 0.08]} />
      </Part>
      <Part id="pump">
        <Cyl kind="steel" radius={0.045} length={0.12} axis="x" position={[-0.02, 0.24, -0.2]} />
        <Cyl kind="dark" radius={0.05} length={0.09} axis="x" position={[0.09, 0.24, -0.2]} />
      </Part>
      <Part id="board">
        <Block kind="pcb" size={[0.008, 0.24, 0.38]} position={[-0.148, 0.3, -0.06]} radius={0.002} />
        <Block kind="dark" size={[0.008, 0.05, 0.06]} position={[-0.14, 0.34, -0.12]} radius={0.002} />
        <Block kind="dark" size={[0.008, 0.035, 0.035]} position={[-0.14, 0.24, 0.04]} radius={0.002} />
        <Block kind="copper" size={[0.006, 0.02, 0.16]} position={[-0.142, 0.2, -0.06]} radius={0.002} />
      </Part>
      <Tubes />
    </>
  );
}

export { Wire };
