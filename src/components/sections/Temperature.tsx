import { copy } from "@/content/copy";
import { Body, Caption, Headline, Kicker, Meta, Section } from "./Section";

export function Temperature() {
  const c = copy.temperature;
  return (
    <Section beat="temperature">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <div data-slot="temperature-chart" className="mt-5 md:mt-8" />
      <Meta>{c.meta}</Meta>
      <Caption>{copy.hero.caption}</Caption>
    </Section>
  );
}
