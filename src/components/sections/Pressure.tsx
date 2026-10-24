import { copy } from "@/content/copy";
import { Body, Caption, Headline, Kicker, Meta, Section } from "./Section";

export function Pressure() {
  const c = copy.pressure;
  return (
    <Section beat="pressure">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <div data-slot="pressure-chart" className="mt-5 md:mt-8" />
      <Meta>{c.meta}</Meta>
      <Caption>{copy.hero.caption}</Caption>
    </Section>
  );
}
