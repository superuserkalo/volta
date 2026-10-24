import { copy } from "@/content/copy";
import { Section } from "./Section";

/** Blueprint beat: the machine becomes a line drawing; the four specs read like a drawing's title block. */
export function Specs() {
  return (
    <Section beat="specs" className="md:justify-end md:pb-14">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ink/25 pt-5 md:grid-cols-4 md:gap-10 md:pt-8" data-reveal>
        {copy.specs.map((s) => (
          <div key={s.value}>
            <dt className="font-mono text-2xl tracking-tight text-ink md:text-4xl">{s.value}</dt>
            <dd className="meta mt-1.5 text-[0.62rem] text-ink/60 md:mt-3 md:text-xs">{s.label}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
