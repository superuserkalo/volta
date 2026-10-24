import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { copy } from "@/content/copy";
import { Body, Caption, Headline, Kicker, Meta, Section } from "./Section";

export function Temperature() {
  const c = copy.temperature;
  return (
    <Section beat="temperature">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <div className="mt-5 md:mt-8" data-reveal><TemperatureChart /></div>
      <Meta>{c.meta}</Meta>
      <Caption>{copy.hero.caption}</Caption>
    </Section>
  );
}
