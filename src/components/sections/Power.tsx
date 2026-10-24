import { copy } from "@/content/copy";
import { Body, Headline, Kicker, Section } from "./Section";

export function Power() {
  const c = copy.power;
  return (
    <Section beat="power">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <ol className="mt-5 grid gap-2 md:mt-8 md:gap-3" data-reveal>
        {c.cards.map((card, i) => (
          <li
            key={card.title}
            data-power-card={i}
            className="group rounded-md border border-line bg-bg/70 px-4 py-3 backdrop-blur-sm transition-colors data-[active=true]:border-copper/60 md:px-5 md:py-4"
          >
            <p className="kicker !mb-1 text-[0.62rem] md:text-[0.7rem]">{card.tag}</p>
            <p className="text-base md:text-xl">{card.title}</p>
            <p className="mt-1 hidden text-sm leading-relaxed text-text-2 group-data-[active=true]:block md:block md:text-[0.95rem]">
              {card.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
