"use client";

import { copy } from "@/content/copy";
import { sceneStateAt } from "@/story/scene-state";
import { useStoryPosition } from "@/story/store";

const CARD_FOR = { "b-mount": 0, "v-mount": 1, "a-mount": 1, "power-tool": 2, none: -1 } as const;

/** The three power cards; the one matching the battery on screen is open. */
export function PowerCards() {
  const p = useStoryPosition();
  const active = CARD_FOR[sceneStateAt(p, "landscape").battery];
  return (
    <ol className="mt-5 grid gap-2 md:mt-8 md:gap-3" data-reveal>
      {copy.power.cards.map((card, i) => (
        <li
          key={card.title}
          data-power-card={i}
          data-active={i === active}
          className="group rounded-md border border-line bg-bg/70 px-4 py-3 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 data-[active=true]:border-copper data-[active=true]:shadow-[inset_3px_0_0_var(--copper)] md:px-5 md:py-4"
        >
          <p className="kicker !mb-1 text-[0.62rem] md:text-[0.7rem]">{card.tag}</p>
          <p className="text-base md:text-xl">{card.title}</p>
          {/* the body opens and closes with the pack instead of jumping the layout */}
          <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-500 ease-out group-data-[active=true]:grid-rows-[1fr] group-data-[active=true]:opacity-100">
            <p className="overflow-hidden text-sm leading-relaxed text-text-2 md:text-[0.95rem]">
              <span className="block pt-1">{card.body}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
