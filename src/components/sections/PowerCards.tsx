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
          className="group rounded-md border border-line bg-bg/70 px-4 py-3 backdrop-blur-sm transition-colors duration-300 data-[active=true]:border-copper/60 md:px-5 md:py-4"
        >
          <p className="kicker !mb-1 text-[0.62rem] md:text-[0.7rem]">{card.tag}</p>
          <p className="text-base md:text-xl">{card.title}</p>
          <p className="mt-1 hidden text-sm leading-relaxed text-text-2 group-data-[active=true]:block md:text-[0.95rem]">{card.body}</p>
        </li>
      ))}
    </ol>
  );
}
