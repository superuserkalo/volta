"use client";

import { beatIndex } from "@/story/beats";
import { useStoryPosition } from "@/story/store";

const NUMBERED = ["pressure", "temperature", "control", "power", "repair", "lab"] as const;
const FIRST = beatIndex("pressure");

/** 01–06 progress, like the section numbers in VOLTA's copy. */
export function ProgressRail() {
  const p = useStoryPosition();
  const visible = p >= FIRST - 0.6 && p < FIRST + NUMBERED.length;
  return (
    <div
      aria-hidden
      data-progress-rail
      data-visible={visible}
      className="pointer-events-none fixed inset-x-4 top-[3.6rem] z-30 flex gap-1 opacity-0 transition-opacity duration-500 data-[visible=true]:opacity-100 md:inset-x-auto md:top-auto md:right-12 md:bottom-8 md:w-72 md:gap-1.5 lg:right-[7.5rem]"
    >
      {NUMBERED.map((id, i) => {
        const fill = Math.min(1, Math.max(0, p - (FIRST + i)));
        const active = fill > 0 && fill < 1;
        return (
          <div key={id} data-active={active} className="flex-1">
            <div className="h-[2px] overflow-hidden rounded-full bg-text/15 tone-chrome-track">
              <div className="h-full origin-left bg-copper" style={{ transform: `scaleX(${fill})` }} />
            </div>
            <p className="meta mt-1.5 hidden text-[0.6rem] text-text-4 md:block md:data-[active=true]:text-copper">
              {String(i + 1).padStart(2, "0")}
            </p>
          </div>
        );
      })}
    </div>
  );
}
