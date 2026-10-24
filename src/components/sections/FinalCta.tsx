import { copy } from "@/content/copy";
import { SignupForm } from "@/components/signup/SignupForm";
import { Section } from "./Section";

export function FinalCta() {
  const c = copy.cta;
  return (
    <Section beat="cta" align="center">
      <div className="rounded-lg bg-bg/80 p-5 text-center backdrop-blur-md md:bg-transparent md:p-0 md:backdrop-blur-none">
        <p className="kicker mb-4 md:mb-6" data-reveal>{c.eyebrow}</p>
        <h2 data-reveal className="text-[2.6rem] leading-none font-medium tracking-[-0.04em] md:text-[4.5rem]">
          {c.headline}
        </h2>
        <p data-reveal className="mx-auto mt-4 max-w-[38rem] text-[0.95rem] leading-relaxed text-text-2 md:mt-6 md:text-xl">
          {c.body}
        </p>
        <div data-reveal className="mx-auto mt-6 max-w-[40rem] md:mt-9">
          <SignupForm variant="cta" />
          <p className="mt-3 text-xs text-text-4 md:text-sm">{c.note}</p>
        </div>
      </div>
    </Section>
  );
}
