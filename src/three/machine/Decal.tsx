"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useSceneStateRef } from "./context";

type V3 = [number, number, number];
type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, fonts: { sans: string; mono: string }) => void;

function fontFamilies() {
  const css = getComputedStyle(document.body);
  return {
    sans: css.getPropertyValue("--font-instrument").trim() || "system-ui, sans-serif",
    mono: css.getPropertyValue("--font-martian").trim() || "ui-monospace, monospace",
  };
}

/** A printed or engraved marking on a surface, drawn into a canvas texture. Fades out in x-ray. */
export function Decal({
  size,
  position,
  rotation,
  draw,
  px = 512,
  opacity = 1,
}: {
  size: [number, number];
  position: V3;
  rotation?: V3;
  draw: Draw;
  px?: number;
  opacity?: number;
}) {
  const state = useSceneStateRef();
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const w = px;
    const h = Math.max(8, Math.round((px * size[1]) / size[0]));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    draw(ctx, w, h, fontFamilies());
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [px, size, draw, fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    if (mat.current) mat.current.opacity = opacity * (1 - state.current.xray * 0.92);
  });

  if (!texture) return null;
  return (
    <mesh position={position} rotation={rotation} userData={{ noLook: true }} renderOrder={1}>
      <planeGeometry args={size} />
      <meshBasicMaterial ref={mat} map={texture} transparent depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}
