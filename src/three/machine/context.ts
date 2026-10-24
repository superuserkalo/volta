import { createContext, useContext, type RefObject } from "react";
import type { SceneState } from "@/story/scene-state";

/** The damped scene state, updated every frame by the camera rig. Parts read it in useFrame. */
export const SceneStateContext = createContext<RefObject<SceneState> | null>(null);

export function useSceneStateRef() {
  const ref = useContext(SceneStateContext);
  if (!ref) throw new Error("SceneStateContext missing");
  return ref;
}
