import type { ReactNode } from "react";
import { BEATS, type BeatId } from "@/story/beats";
import { cn } from "@/lib/utils";

type Props = {
  beat: BeatId;
  /** Desktop placement of the text column; mobile always uses the bottom panel. */
  align?: "left" | "right" | "center";
  className?: string;
  children: ReactNode;
  /** Fractions of the section where the scroll snaps and stops once (the quote's door gate, each battery). */
  stops?: readonly number[];
};

/**
 * A beat of the scroll story. The section is as tall as the beat's scroll
 * distance; its content is pinned (sticky) for that distance while the 3D
 * stage behind it animates.
 */
export function Section({ beat, align = "left", className, children, stops = [] }: Props) {
  const def = BEATS.find((b) => b.id === beat)!;
  return (
    <section
      id={beat}
      data-beat={beat}
      data-tone={def.tone}
      style={{ minHeight: `${def.lengthVh}svh` }}
      className="relative"
    >
      {stops.map((at) => (
        <div
          key={at}
          aria-hidden
          data-gate
          className="pointer-events-none absolute left-0 h-px w-px snap-start snap-always"
          style={{ top: `${at * 100}%` }}
        />
      ))}
      <div className="sticky top-0 flex h-svh w-full overflow-hidden">
        <div
          data-panel
          className={cn(
            "beat-panel relative z-10 mx-auto flex w-full max-w-[1440px] flex-col px-4 md:px-12 lg:px-[7.5rem]",
            // mobile: content sits in the lower part of the screen
            "justify-end pb-6 md:pb-0",
            align === "center" ? "md:items-center md:justify-center md:text-center" : "md:justify-center",
            className,
          )}
        >
          <div
            className={cn(
              "beat-copy w-full",
              align === "left" && beat !== "quote" && "md:max-w-[34rem]",
              align === "right" && "md:ml-auto md:max-w-[34rem]",
              align === "center" && "md:max-w-[46rem]",
              beat === "quote" && "md:max-w-[40rem]",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker mb-4 md:mb-6" data-reveal>{children}</p>;
}

export function Headline({ children, as: Tag = "h2" }: { children: ReactNode; as?: "h1" | "h2" }) {
  return (
    <Tag
      data-reveal
      className="font-sans text-[2.4rem] leading-[1.02] font-medium tracking-[-0.035em] text-balance md:text-[4rem]"
    >
      {children}
    </Tag>
  );
}

export function Body({ children }: { children: ReactNode }) {
  return (
    <p data-reveal className="mt-4 text-[0.95rem] leading-relaxed text-text-2 tone-light:text-ink/80 md:mt-6 md:text-lg">
      {children}
    </p>
  );
}

export function Meta({ children }: { children: ReactNode }) {
  return (
    <p data-reveal className="meta mt-4 text-[0.7rem] text-text-4 md:mt-6 md:text-sm">
      {children}
    </p>
  );
}

export function Caption({ children }: { children: ReactNode }) {
  return (
    <p data-reveal className="meta mt-3 text-[0.62rem] text-text-4 md:text-xs">
      {children}
    </p>
  );
}
