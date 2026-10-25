import { copy } from "@/content/copy";
import { beatIndex } from "@/story/beats";
import { POWER_STOPS } from "@/story/keyframes";
import { PowerCards } from "./PowerCards";
import { Body, Headline, Kicker, Section } from "./Section";

export function Power() {
  const c = copy.power;
  return (
    <Section beat="power" stops={POWER_STOPS.map((p) => p - beatIndex("power"))}>
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <PowerCards />
    </Section>
  );
}
