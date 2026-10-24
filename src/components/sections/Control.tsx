import { copy } from "@/content/copy";
import { Rows } from "./Rows";
import { Body, Headline, Kicker, Section } from "./Section";

export function Control() {
  const c = copy.control;
  return (
    <Section beat="control">
      <Kicker>{c.kicker}</Kicker>
      <Headline>{c.headline}</Headline>
      <Body>{c.body}</Body>
      <Rows rows={c.rows} />
    </Section>
  );
}
