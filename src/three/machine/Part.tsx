"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { PartId } from "@/story/scene-state";
import { useSceneStateRef } from "./context";
import { lookFor, type Kind } from "./looks";
import { partDef } from "./parts";

const EDGE_THRESHOLD = 25;

/**
 * A named machine part. Children are meshes tagged with `userData.kind`.
 * Each frame the part moves along its explode vector and every mesh takes the
 * look for the current render mode (shaded / blueprint / x-ray / highlight).
 */
export function Part({ id, children, position }: { id: PartId; children: ReactNode; position?: [number, number, number] }) {
  const def = partDef(id);
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const state = useSceneStateRef();
  const meshes = useRef<{ mesh: THREE.Mesh; kind: Kind; mat: THREE.MeshStandardMaterial; edges: THREE.LineSegments }[]>([]);
  const edgeMat = useRef(new THREE.LineBasicMaterial({ color: "#2a2c2e", transparent: true, opacity: 0, depthWrite: false }));

  useLayoutEffect(() => {
    const list: typeof meshes.current = [];
    inner.current?.traverse((o) => {
      if (!(o instanceof THREE.Mesh) || o.userData.noLook) return;
      const kind = (o.userData.kind ?? "alu") as Kind;
      const mat = new THREE.MeshStandardMaterial({ envMapIntensity: 1 });
      o.material = mat;
      o.castShadow = true;
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, EDGE_THRESHOLD), edgeMat.current);
      edges.renderOrder = 2;
      edges.raycast = () => {};
      o.add(edges);
      list.push({ mesh: o, kind, mat, edges });
    });
    meshes.current = list;
    return () => {
      for (const m of list) {
        m.mesh.remove(m.edges);
        m.edges.geometry.dispose();
        m.mat.dispose();
      }
    };
  }, []);

  useFrame(() => {
    const s = state.current;
    if (outer.current) {
      outer.current.position.set(def.explode[0] * s.explode, def.explode[1] * s.explode, def.explode[2] * s.explode);
    }
    let edgeOpacity = 0;
    const cache = new Map<Kind, ReturnType<typeof lookFor>>();
    for (const m of meshes.current) {
      let look = cache.get(m.kind);
      if (!look) {
        look = lookFor(m.kind, def.group, id, s);
        cache.set(m.kind, look);
      }
      m.mesh.visible = look.visible;
      const mat = m.mat;
      mat.color.set(look.color);
      mat.metalness = look.metalness;
      mat.roughness = look.roughness;
      mat.emissive.set(look.emissive);
      mat.emissiveIntensity = look.emissiveIntensity;
      const transparent = look.opacity < 0.999;
      if (mat.transparent !== transparent) {
        mat.transparent = transparent;
        mat.needsUpdate = true;
      }
      mat.opacity = look.opacity;
      mat.depthWrite = look.opacity > 0.5;
      edgeOpacity = Math.max(edgeOpacity, look.edgeOpacity);
    }
    edgeMat.current.color.set(s.blueprint > 0.5 ? "#2a2c2e" : "#8a9096");
    edgeMat.current.opacity = edgeOpacity;
    edgeMat.current.visible = edgeOpacity > 0.01;
  });

  return (
    <group ref={outer} name={id}>
      <group ref={inner} position={position}>
        {children}
      </group>
    </group>
  );
}
