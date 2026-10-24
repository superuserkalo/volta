"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Kind } from "./looks";

type V3 = [number, number, number];

/** Rounded box centered at `position`. */
export function Block({
  kind,
  size,
  position = [0, 0, 0],
  rotation,
  radius = 0.004,
}: {
  kind: Kind;
  size: V3;
  position?: V3;
  rotation?: V3;
  radius?: number;
}) {
  const geo = useMemo(
    () => new RoundedBoxGeometry(size[0], size[1], size[2], 2, Math.min(radius, Math.min(...size) / 2 - 1e-4)),
    [size[0], size[1], size[2], radius], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <mesh geometry={geo} position={position} rotation={rotation} userData={{ kind }} />;
}

/** Cylinder; `axis` picks which world axis it runs along. */
export function Cyl({
  kind,
  radius,
  length,
  position = [0, 0, 0],
  axis = "y",
  segments = 32,
  open = false,
}: {
  kind: Kind;
  radius: number;
  length: number;
  position?: V3;
  axis?: "x" | "y" | "z";
  segments?: number;
  open?: boolean;
}) {
  const rotation: V3 = axis === "x" ? [0, 0, Math.PI / 2] : axis === "z" ? [Math.PI / 2, 0, 0] : [0, 0, 0];
  const geo = useMemo(() => new THREE.CylinderGeometry(radius, radius, length, segments, 1, open), [radius, length, segments, open]);
  return <mesh geometry={geo} position={position} rotation={rotation} userData={{ kind }} />;
}

/** A side-profile polygon (points as [z, y]) extruded across the width (x from -w/2 to w/2). */
export function Profile({ kind, points, width, bevel = 0.004 }: { kind: Kind; points: [number, number][]; width: number; bevel?: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(z, y)));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: width - bevel * 2,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 6,
    });
    // shape x → world z, extrusion → world x, centered
    g.rotateY(-Math.PI / 2);
    g.translate(width / 2 - bevel, 0, 0);
    return g;
  }, [points, width, bevel]);
  return <mesh geometry={geo} userData={{ kind }} />;
}

/** A bent wire, e.g. the cup rest. */
export function Wire({ kind, path, radius = 0.005 }: { kind: Kind; path: V3[]; radius?: number }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(path.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.1);
    return new THREE.TubeGeometry(curve, 48, radius, 10, false);
  }, [path, radius]);
  return <mesh geometry={geo} userData={{ kind }} />;
}
