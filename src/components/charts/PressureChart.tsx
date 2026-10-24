"use client";

import { copy } from "@/content/copy";
import { beatIndex } from "@/story/beats";
import { useStoryPosition } from "@/story/store";
import { CURVES, GRID_Y, TIME_TICKS, VIEWBOX, drawAmount } from "./chart-data";

const BEAT = beatIndex("pressure");
const mono = "var(--font-martian), ui-monospace, monospace";

/** VOLTA's pressure-profile chart; the curves draw themselves as the beat scrolls. */
export function PressureChart() {
  const p = useStoryPosition();
  const t = Math.min(1, Math.max(0, p - BEAT));
  const legendColors = ["#BB6622", "#868B8F", "#5B7A94"];
  return (
    <figure className="rounded-lg border border-line bg-bg-raised/85 p-3 backdrop-blur-sm md:p-4" data-chart="pressure">
      <svg viewBox={VIEWBOX} className="block h-auto w-full max-h-[22svh] md:max-h-none" role="img" aria-label="Pressure profile curves: flat, lever, custom">
        <defs>
          {CURVES.map((c, i) => (
            <clipPath key={c.key} id={`reveal-${c.key}`}>
              <rect x={0} y={0} height={560} width={70 + 700 * drawAmount(t, i)} />
            </clipPath>
          ))}
        </defs>
        <g stroke="#33373A" strokeWidth={1}>
          {GRID_Y.map((g) => <line key={g.y} x1={70} x2={760} y1={g.y} y2={g.y} />)}
        </g>
        <g fill="#5F6367" fontFamily={mono} fontSize={17} textAnchor="end">
          {GRID_Y.map((g) => <text key={g.y} x={58} y={g.y + 5}>{g.label}</text>)}
        </g>
        <text x={70} y={66} fill="#868B8F" fontFamily={mono} fontSize={17} letterSpacing={1.4}>{copy.pressure.chartTitle}</text>
        <g fill="#5F6367" fontFamily={mono} fontSize={17}>
          {TIME_TICKS.map((k) => <text key={k.x} x={k.x} y={548} textAnchor={k.anchor}>{k.label}</text>)}
        </g>
        {CURVES.map((c, i) => (
          <path
            key={c.key}
            d={c.d}
            fill="none"
            stroke={c.stroke}
            strokeWidth={c.width}
            strokeDasharray={"dash" in c ? c.dash : undefined}
            clipPath={`url(#reveal-${c.key})`}
          />
        ))}
        <circle cx={760} cy={257} r={6} fill="#BB6622" opacity={drawAmount(t, 2) >= 1 ? 1 : 0} style={{ transition: "opacity .3s" }} />
      </svg>
      <figcaption className="meta mt-2 flex flex-wrap justify-end gap-x-5 gap-y-1 text-[0.6rem] text-text-3 md:text-xs">
        {copy.pressure.legend.map((l, i) => (
          <span key={l} className="flex items-center gap-2" style={{ color: i === 0 ? "#BB6622" : i === 2 ? "#5B7A94" : undefined }}>
            <span className="inline-block h-0 w-4 border-t-2" style={{ borderColor: legendColors[i], borderStyle: i === 2 ? "dashed" : "solid" }} />
            {l}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
