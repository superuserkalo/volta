import { copy } from "@/content/copy";
import { PowerCards } from "./PowerCards";
import { Body, Headline, Kicker, Section } from "./Section";

export function Power() {
  const c = copy.power;
  return (
    <Section beat="power">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <PowerCards />
    </Section>
  );
}
