import { copy } from "@/content/copy";
import { Rows } from "./Rows";
import { Body, Caption, Headline, Kicker, Section } from "./Section";

export function Repair() {
  const c = copy.repair;
  return (
    <Section beat="repair">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <Rows rows={c.rows} />
      <Caption>{copy.hero.caption}</Caption>
    </Section>
  );
}
