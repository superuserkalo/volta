"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useSceneStateRef } from "./context";
import { Exterior } from "./Exterior";
import { BrewGroup, Internals } from "./Internals";
import { Power } from "./Power";

/** The VOLTA machine. Reads the damped scene state from context; rotates about its own vertical axis. */
export function Machine() {
  const state = useSceneStateRef();
  const root = useRef<THREE.Group>(null);
  useFrame(() => {
    if (root.current) root.current.rotation.y = state.current.machineYaw;
  });
  return (
    <group ref={root}>
      <Exterior headChildren={<BrewGroup />} />
      <Internals />
      <Power />
    </group>
  );
}
