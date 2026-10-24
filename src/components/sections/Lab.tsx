import { copy } from "@/content/copy";
import { Body, Headline, Kicker, Meta, Section } from "./Section";

export function Lab() {
  const c = copy.lab;
  return (
    <Section beat="lab">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <ul className="mt-5 grid grid-cols-2 gap-2 md:mt-8 md:gap-3" data-reveal>
        {c.cards.map((card) => (
          <li key={card.title} className="rounded-md border border-line bg-bg/70 px-3 py-2.5 backdrop-blur-sm md:px-4 md:py-3.5">
            <p className="kicker !mb-1 text-[0.58rem] md:text-[0.65rem]">{card.status}</p>
            <p className="text-sm md:text-base">{card.title}</p>
            <p className="mt-1 hidden text-[0.82rem] leading-snug text-text-3 md:block">{card.body}</p>
          </li>
        ))}
      </ul>
      <Meta>{c.meta}</Meta>
    </Section>
  );
}
