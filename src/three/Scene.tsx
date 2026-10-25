"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { damp } from "@/story/position";
import type { Framing, SceneState } from "@/story/scene-state";
import { SceneStateContext } from "./machine/context";
import { Machine } from "./machine/Machine";
import { Callouts } from "./machine/Callouts";

const DARK = new THREE.Color("#131516");
const PAPER = new THREE.Color("#d9d6d3");

const NUMERIC = ["machineYaw", "paper", "blueprint", "xray", "callouts", "explode", "boilerGlow", "panelLights", "presence"] as const;

/** The door is an activation, not a scrub: it opens or closes over this many seconds once the gate flips. */
const DOOR_SECONDS = 1.6;

export type StateSource = (framing: Framing, aspect: number, elapsed: number) => SceneState;

function cloneState(s: SceneState): SceneState {
  return { ...s, camera: { position: [...s.camera.position], target: [...s.camera.target], fov: s.camera.fov } };
}

/** Damps the displayed state toward the source every frame and drives camera + background. */
function Rig({
  source,
  lambda: baseLambda,
  stateRef,
  cut,
}: {
  source: StateSource;
  lambda: number;
  stateRef: React.RefObject<SceneState>;
  cut?: () => boolean;
}) {
  const { camera, scene, size, gl } = useThree();
  const bg = useMemo(() => new THREE.Color(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    // dev only: lets scripts read what the stage is showing
    if (process.env.NODE_ENV !== "production") (window as unknown as { __voltaStage: unknown }).__voltaStage = stateRef;
  }, [stateRef]);
  useFrame((st, dtRaw) => {
    const dt = Math.min(dtRaw, 0.1);
    const framing: Framing = size.height > size.width ? "portrait" : "landscape";
    const target = source(framing, size.width / size.height, st.clock.elapsedTime);
    const cur = stateRef.current;
    // A jump, not a scroll (reload, anchor link): show the new shot as it is, no fly-over.
    const isCut = cut?.() ?? false;
    const lambda = isCut ? 1e6 : baseLambda;
    for (const k of NUMERIC) cur[k] = damp(cur[k], target[k], lambda, dt);
    // A pack is only swapped once the one on screen is fully off, so a fast scroll never pops it.
    // Packs follow the scroll tighter than the camera so they land with a firm stop, not a drift.
    if (isCut) cur.battery = target.battery;
    const swapping = cur.battery !== target.battery;
    cur.batteryAttach = damp(cur.batteryAttach, swapping ? 0 : target.batteryAttach, lambda * 2.2, dt);
    if (swapping && cur.batteryAttach < 0.02) cur.battery = target.battery;
    cur.highlight = target.highlight;
    cur.gate = target.gate;
    const step = isCut ? 1 : dt / DOOR_SECONDS;
    cur.trayOpen = cur.trayOpen < target.trayOpen ? Math.min(target.trayOpen, cur.trayOpen + step) : Math.max(target.trayOpen, cur.trayOpen - step);
    cur.focus = target.focus;
    const c = cur.camera;
    c.position = c.position.map((v, i) => damp(v, target.camera.position[i], lambda, dt)) as unknown as SceneState["camera"]["position"];
    c.target = c.target.map((v, i) => damp(v, target.camera.target[i], lambda, dt)) as unknown as SceneState["camera"]["target"];
    c.fov = damp(c.fov, target.camera.fov, lambda, dt);

    const cam = camera as THREE.PerspectiveCamera;
    cam.position.copy(pos.set(...c.position));
    cam.lookAt(tgt.set(...c.target));
    if (Math.abs(cam.fov - c.fov) > 1e-3) {
      cam.fov = c.fov;
      cam.updateProjectionMatrix();
    }
    bg.copy(DARK).lerp(PAPER, cur.paper);
    scene.background = bg;
    // Leaving the stage: fade the whole canvas so the page below shows through.
    gl.domElement.style.opacity = String(cur.presence);
  }, -1);
  return null;
}

function Shadow({ stateRef }: { stateRef: React.RefObject<SceneState> }) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (group.current) group.current.visible = stateRef.current.paper < 0.5 && stateRef.current.explode < 0.05;
  });
  return (
    <group ref={group}>
      <ContactShadows position={[0, 0.001, 0]} scale={2.4} blur={2.4} opacity={0.65} far={0.6} resolution={512} color="#000000" />
    </group>
  );
}

function Studio() {
  // Procedural studio lighting (no downloaded HDR): soft boxes like a product shoot.
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#4a4e52"]} />
      <Lightformer form="rect" intensity={1.4} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 12, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[2.5, 3, 3]} scale={[4, 2, 1]} target={[0, 0.5, 0]} />
      <Lightformer form="rect" intensity={1.2} position={[-3, 2, 1.5]} scale={[3, 3, 1]} target={[0, 0.5, 0]} />
      <Lightformer form="rect" intensity={0.8} position={[0, 4, -2]} scale={[5, 1, 1]} target={[0, 0.5, 0]} />
      <Lightformer form="ring" intensity={0.6} color="#ffd9b8" position={[-1, 0.4, 4]} scale={1.5} target={[0, 0.5, 0]} />
    </Environment>
  );
}

export default function Scene({
  source,
  initial,
  lambda = 6,
  dprMax = 2,
  onReady,
  cut,
}: {
  source: StateSource;
  initial: SceneState;
  lambda?: number;
  dprMax?: number;
  onReady?: () => void;
  /** Called every frame; true = cut straight to the source state instead of easing toward it. */
  cut?: () => boolean;
}) {
  const stateRef = useRef<SceneState>(cloneState(initial));
  return (
    <Canvas
      dpr={[1, dprMax]}
      camera={{ fov: initial.camera.fov, near: 0.05, far: 40, position: [...initial.camera.position] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        requestAnimationFrame(() => onReady?.());
      }}
    >
      <SceneStateContext.Provider value={stateRef}>
        <Rig source={source} lambda={lambda} stateRef={stateRef} cut={cut} />
        <Studio />
        <hemisphereLight args={["#f2f2f2", "#202224", 0.45]} />
        <directionalLight position={[2.5, 4, 3]} intensity={1.1} />
        <directionalLight position={[-3, 2, -1]} intensity={0.35} />
        <Machine />
        <Callouts />
        <Shadow stateRef={stateRef} />
      </SceneStateContext.Provider>
    </Canvas>
  );
}
