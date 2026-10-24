"use client";

import { copy } from "@/content/copy";
import { beatIndex } from "@/story/beats";
import { useStoryPosition } from "@/story/store";
import { ROASTS, TEMP_RANGE, VIEWBOX, xForTemp } from "./chart-data";

const BEAT = beatIndex("temperature");
const mono = "var(--font-martian), ui-monospace, monospace";
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (k: number) => 1 - Math.pow(1 - k, 3);

/** VOLTA's roast-matched setpoints; each target slides in from 85.0 and settles with its ±0.5 °C hold band. */
export function TemperatureChart() {
  const p = useStoryPosition();
  const t = clamp01(p - BEAT);
  return (
    <figure className="rounded-lg border border-line bg-bg-raised/85 p-3 backdrop-blur-sm md:p-4" data-chart="temperature">
      <svg viewBox={VIEWBOX} className="block h-auto w-full max-h-[22svh] md:max-h-none" role="img" aria-label="Roast-matched boiler setpoints">
        <text x={70} y={66} fill="#868B8F" fontFamily={mono} fontSize={17} letterSpacing={1.4}>{copy.temperature.chartTitle}</text>
        {ROASTS.map((r, i) => {
          const k = ease(clamp01((t - 0.1 - i * 0.1) / 0.4));
          const value = TEMP_RANGE.min + (r.value - TEMP_RANGE.min) * k;
          const cx = xForTemp(value);
          const line = r.y + 30;
          return (
            <g key={r.label}>
              <text x={70} y={r.y} fill="#AEB2B5" fontFamily={mono} fontSize={17} letterSpacing={1.4}>{r.label}</text>
              <text x={760} y={r.y} fill="#E9E9E9" fontFamily={mono} fontSize={20} textAnchor="end">{value.toFixed(1)}</text>
              <line x1={70} x2={760} y1={line} y2={line} stroke="#33373A" strokeWidth={1} />
              <line x1={cx - 25} x2={cx + 25} y1={line} y2={line} stroke="#474B4E" strokeWidth={5} opacity={k} />
              <circle cx={cx} cy={line} r={7} fill="#BB6622" />
            </g>
          );
        })}
        <line x1={70} x2={760} y1={486} y2={486} stroke="#33373A" strokeWidth={1} />
        <g stroke="#474B4E" strokeWidth={1}>
          {[70, 415, 760].map((x) => <line key={x} x1={x} x2={x} y1={480} y2={492} />)}
        </g>
        <g fill="#5F6367" fontFamily={mono} fontSize={17}>
          <text x={70} y={522}>85.0</text>
          <text x={415} y={522} textAnchor="middle">92.0</text>
          <text x={760} y={522} textAnchor="end">99.0</text>
        </g>
      </svg>
      <figcaption className="meta mt-2 flex justify-end gap-5 text-[0.6rem] text-text-3 md:text-xs">
        <span className="flex items-center gap-2"><span className="inline-block h-1 w-4 rounded bg-[#474B4E]" />{copy.temperature.hold}</span>
        <span className="flex items-center gap-2 text-copper"><span className="inline-block size-2 rounded-full bg-copper" />{copy.temperature.target}</span>
      </figcaption>
    </figure>
  );
}
