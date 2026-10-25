"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneStateRef } from "./context";
import { Decal } from "./Decal";
import { DIM, HALF_W, PLATE_X } from "./dimensions";
import { drawCupIcon, drawGrateHoles, drawPanelLabels, drawPowerIcon, drawSteamIcon, drawWordmark } from "./markings";
import { Part } from "./Part";
import { Block, Cyl, Profile, Wire } from "./shapes";

const W = DIM.bodyW;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The machine opens like the reveal video: the head unit slides out first, then the front door folds down into the tray. */
export const openPhases = (trayOpen: number) => ({
  slide: ease(clamp01(trayOpen / 0.45)),
  fold: ease(clamp01((trayOpen - 0.35) / 0.65)),
});

// Slanted control face of the head, from the top of the front face to the top deck.
const SLANT_FROM = { z: 0.468, y: 0.755 };
const SLANT_TO = { z: 0.418, y: 0.975 };
const SLANT_ANGLE = -Math.atan2(SLANT_FROM.z - SLANT_TO.z, SLANT_TO.y - SLANT_FROM.y); // rotation.x for a plane on the slant
const slantPoint = (t: number, out = 0.002): [number, number] => {
  const z = SLANT_FROM.z + (SLANT_TO.z - SLANT_FROM.z) * t;
  const y = SLANT_FROM.y + (SLANT_TO.y - SLANT_FROM.y) * t;
  const len = Math.hypot(SLANT_FROM.z - SLANT_TO.z, SLANT_TO.y - SLANT_FROM.y);
  const nz = (SLANT_TO.y - SLANT_FROM.y) / len;
  const ny = (SLANT_FROM.z - SLANT_TO.z) / len;
  return [z + nz * out, y + ny * out];
};

function SidePlate({ side }: { side: -1 | 1 }) {
  const shape = useMemo(() => {
    const r = 0.022;
    const z0 = DIM.plateBack, z1 = DIM.plateFront, y0 = 0.006, y1 = 1.0;
    const s = new THREE.Shape();
    s.moveTo(z0 + r, y0);
    s.lineTo(z1 - r, y0);
    s.quadraticCurveTo(z1, y0, z1, y0 + r);
    s.lineTo(z1, y1 - r);
    s.quadraticCurveTo(z1, y1, z1 - r, y1);
    s.lineTo(z0 + r, y1);
    s.quadraticCurveTo(z0, y1, z0, y1 - r);
    s.lineTo(z0, y0 + r);
    s.quadraticCurveTo(z0, y0, z0 + r, y0);
    return s;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: DIM.plate, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 1 });
    g.rotateY(-Math.PI / 2);
    g.translate(DIM.plate / 2, 0, 0);
    return g;
  }, [shape]);
  const x = side * PLATE_X;
  const outer = x + side * (DIM.plate / 2 + 0.002);
  const screws: [number, number][] = [
    [-0.445, 0.05],
    [-0.445, 0.955],
    [0.4, 0.05],
    [0.4, 0.62],
    [-0.02, 0.955],
  ];
  return (
    <Part id={side < 0 ? "side-left" : "side-right"}>
      <mesh geometry={geo} position={[x, 0, 0]} userData={{ kind: "black" }} />
      {screws.map(([z, y]) => (
        <Cyl key={`${z}${y}`} kind="dark" radius={0.008} length={0.004} axis="x" position={[outer, y, z]} segments={16} />
      ))}
      {/* level window */}
      <Block kind="dark" size={[0.004, 0.3, 0.024]} position={[outer, 0.52, -0.2]} radius={0.0019} />
    </Part>
  );
}

function Body() {
  return (
    <Part id="body">
      {/* back wall, floor */}
      <Block kind="alu" size={[W, 0.99, 0.012]} position={[0, 0.495, DIM.back + 0.006]} />
      <Block kind="alu" size={[W, 0.012, DIM.front - DIM.back]} position={[0, 0.006, (DIM.front + DIM.back) / 2]} />
      {/* plinth with its shadow gap */}
      <Block kind="alu" size={[W, DIM.plinth[1], 0.06]} position={[0, DIM.plinth[1] / 2, DIM.front - 0.03]} />
      <Block kind="dark" size={[W - 0.004, 0.014, 0.05]} position={[0, DIM.plinth[1] + 0.007, DIM.front - 0.03]} radius={0.002} />
      {/* door cavity: back wall and floor, seen when the door is down */}
      <Block kind="dark" size={[W - 0.002, DIM.door[1] - DIM.door[0], 0.01]} position={[0, (DIM.door[0] + DIM.door[1]) / 2, 0.14]} />
      <Block kind="dark" size={[W - 0.002, 0.008, 0.28]} position={[0, DIM.door[0] + 0.004, 0.28]} />
      {/* water cavity under the top deck, open when the top slides forward */}
      <Block kind="dark" size={[W - 0.01, 0.2, 0.012]} position={[0, 0.88, -0.26]} />
      <Block kind="dark" size={[W - 0.01, 0.012, 0.2]} position={[0, 0.79, -0.36]} />
    </Part>
  );
}

function CupRest() {
  return (
    <Part id="cup-rest">
      <Wire
        kind="steel"
        radius={0.0045}
        path={[
          [0.07, DIM.door[0] + 0.01, 0.2],
          [0.07, 0.33, 0.21],
          [0.072, 0.37, 0.25],
          [0.06, 0.36, 0.3],
          [0.03, 0.35, 0.31],
        ]}
      />
    </Part>
  );
}

/** Head unit: control head, VOLTA panel, the brew group inside, and the top deck. Slides forward when opening. */
function HeadUnit({ children }: { children?: React.ReactNode }) {
  const state = useSceneStateRef();
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) group.current.position.z = openPhases(state.current.trayOpen).slide * DIM.headSlide;
  });

  const headProfile = useMemo<[number, number][]>(
    () => [
      [0.1, DIM.head[0]],
      [0.468, DIM.head[0]],
      [SLANT_FROM.z, SLANT_FROM.y],
      [SLANT_TO.z, SLANT_TO.y],
      [0.404, 0.99],
      [0.1, 0.99],
    ],
    [],
  );
  // Labels sit at t 0.80 / 0.56 on the slant, each light centred just above its label (x ±0.11).
  const labels = slantPoint(0.68, 0.0062);
  const leds: { kind: "led-0" | "led-1" | "led-2" | "led-3"; x: number; t: number }[] = [
    { kind: "led-0", x: -0.11, t: 0.9 },
    { kind: "led-1", x: -0.11, t: 0.66 },
    { kind: "led-2", x: 0.11, t: 0.9 },
    { kind: "led-3", x: 0.11, t: 0.66 },
  ];
  const [buttonZ, buttonY] = slantPoint(0.3, 0.012);
  const iconAt = ((): [number, number] => {
    const [z, y] = slantPoint(0.3, 0.0225);
    return [y, z];
  })();

  return (
    <group ref={group}>
      <Part id="control-head">
        <Profile kind="alu" points={headProfile} width={W - 0.002} bevel={0.005} />
        {/* VOLTA panel and the shadow gap above it */}
        <Block kind="alu" size={[W - 0.004, DIM.panel[1] - DIM.panel[0], 0.32]} position={[0, (DIM.panel[0] + DIM.panel[1]) / 2, DIM.front - 0.16]} radius={0.005} />
        <Block kind="dark" size={[W - 0.012, DIM.head[0] - DIM.panel[1], 0.3]} position={[0, (DIM.panel[1] + DIM.head[0]) / 2, DIM.front - 0.165]} radius={0.002} />
        {/* buttons */}
        {[-0.102, 0, 0.102].map((x) => (
          <Block key={x} kind="alu" size={[0.086, 0.046, 0.02]} position={[x, buttonY, buttonZ]} rotation={[SLANT_ANGLE, 0, 0]} radius={0.006} />
        ))}
        {leds.map((l) => {
          const [z, y] = slantPoint(l.t, 0.0065);
          return <Cyl key={l.kind} kind={l.kind} radius={0.0065} length={0.004} axis="z" position={[l.x, y, z]} segments={16} />;
        })}
      <Decal size={[W - 0.03, 0.105]} position={[0, labels[1], labels[0]]} rotation={[SLANT_ANGLE, 0, 0]} draw={drawPanelLabels} px={768} />
      <Decal size={[0.05, 0.03]} position={[-0.102, ...iconAt]} rotation={[SLANT_ANGLE, 0, 0]} draw={drawPowerIcon} px={128} />
      <Decal size={[0.05, 0.03]} position={[0, ...iconAt]} rotation={[SLANT_ANGLE, 0, 0]} draw={drawCupIcon} px={128} />
      <Decal size={[0.05, 0.03]} position={[0.102, ...iconAt]} rotation={[SLANT_ANGLE, 0, 0]} draw={drawSteamIcon} px={128} />
      <Decal size={[0.16, 0.045]} position={[0, 0.6, DIM.front + 0.0012]} draw={drawWordmark} px={512} opacity={0.9} />
      </Part>

      <Part id="modular-port">
        <Block kind="dark" size={[0.18, 0.012, 0.13]} position={[0, 0.988, 0.352]} radius={0.003} />
      </Part>
      <Part id="front-lid">
        <Block kind="copper" size={[0.165, 0.008, 0.12]} position={[0, 0.997, 0.352]} radius={0.003} />
      </Part>

      <Part id="top-deck">
        <Block kind="alu" size={[W, 0.016, 0.58]} position={[0, 0.984, -0.18]} radius={0.004} />
        <Block kind="dark" size={[0.15, 0.004, 0.075]} position={[0, 0.9925, -0.31]} radius={0.0019} />
        <Block kind="steel" size={[0.05, 0.005, 0.03]} position={[0.035, 0.9935, -0.33]} radius={0.002} />
      </Part>
      <Part id="rear-lid">
        <Block kind="copper" size={[0.09, 0.008, 0.05]} position={[-0.025, 0.996, -0.3]} radius={0.003} />
      </Part>
      {children}
    </group>
  );
}

/** Front door, hinged at its bottom edge; its inside is the cup tray with the drip grate. */
function FrontDoor() {
  const state = useSceneStateRef();
  const hinge = useRef<THREE.Group>(null);
  useFrame(() => {
    if (hinge.current) hinge.current.rotation.x = (openPhases(state.current.trayOpen).fold * Math.PI) / 2;
  });
  const h = DIM.door[1] - DIM.door[0];
  return (
    <group ref={hinge} position={[0, DIM.door[0], DIM.front]}>
      <Part id="front-door">
        <Block kind="alu" size={[W - 0.004, h - 0.006, 0.026]} position={[0, h / 2, -0.013]} radius={0.004} />
        {/* finger pull */}
        <Block kind="dark" size={[0.1, 0.022, 0.01]} position={[0, h - 0.04, 0.001]} radius={0.003} />
        <Block kind="copper" size={[0.084, 0.01, 0.018]} position={[0, h - 0.046, 0.004]} radius={0.003} />
      </Part>
      <Part id="cup-tray">
        {/* raised rim on the inside face */}
        <Block kind="steel" size={[W - 0.03, 0.012, 0.012]} position={[0, 0.012, -0.032]} radius={0.003} />
        <Block kind="steel" size={[W - 0.03, 0.012, 0.012]} position={[0, h - 0.02, -0.032]} radius={0.003} />
        <Block kind="steel" size={[0.012, h - 0.03, 0.012]} position={[-(W / 2 - 0.021), h / 2, -0.032]} radius={0.003} />
        <Block kind="steel" size={[0.012, h - 0.03, 0.012]} position={[W / 2 - 0.021, h / 2, -0.032]} radius={0.003} />
        {/* copper corner tabs, as in the render */}
        {[-1, 1].map((s) => (
          <Block key={s} kind="copper" size={[0.03, 0.016, 0.014]} position={[s * (W / 2 - 0.03), 0.012, -0.03]} radius={0.003} />
        ))}
      </Part>
      <Part id="drip-grate">
        <Block kind="steel" size={[W - 0.06, h - 0.06, 0.006]} position={[0, h / 2, -0.03]} radius={0.002} />
        <Decal size={[W - 0.08, h - 0.08]} position={[0, h / 2, -0.0335]} rotation={[0, Math.PI, 0]} draw={drawGrateHoles} px={512} />
      </Part>
    </group>
  );
}

function Handle() {
  const armX = PLATE_X + DIM.plate / 2 + 0.01;
  const pivot = { y: 0.86, z: -0.2 };
  const end = { y: 0.9, z: -0.55 };
  const len = Math.hypot(end.z - pivot.z, end.y - pivot.y) + 0.03;
  const tilt = Math.atan2(end.y - pivot.y, pivot.z - end.z);
  const mid: [number, number] = [(pivot.y + end.y) / 2, (pivot.z + end.z) / 2];
  return (
    <>
      <Part id="handle">
        {[-1, 1].map((s) => (
          <Block key={s} kind="alu" size={[0.012, 0.055, len]} position={[s * armX, mid[0], mid[1]]} rotation={[tilt, 0, 0]} radius={0.004} />
        ))}
        <Block kind="alu" size={[armX * 2 + 0.012, 0.055, 0.03]} position={[0, end.y + 0.002, end.z - 0.012]} radius={0.006} />
      </Part>
      <Part id="handle-knob">
        {[-1, 1].map((s) => (
          <group key={s}>
            <Cyl kind="copper" radius={0.034} length={0.022} axis="x" position={[s * (armX + 0.013), pivot.y, pivot.z]} />
            <Cyl kind="alu" radius={0.012} length={0.024} axis="x" position={[s * (armX + 0.014), pivot.y, pivot.z]} segments={16} />
          </group>
        ))}
      </Part>
    </>
  );
}

export function Exterior({ headChildren }: { headChildren?: React.ReactNode }) {
  return (
    <>
      <Body />
      <SidePlate side={-1} />
      <SidePlate side={1} />
      <HeadUnit>{headChildren}</HeadUnit>
      <FrontDoor />
      <CupRest />
      <Handle />
    </>
  );
}

export { HALF_W };
