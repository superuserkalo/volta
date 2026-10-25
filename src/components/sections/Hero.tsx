import { copy } from "@/content/copy";
import { SignupForm } from "@/components/signup/SignupForm";
import { Section } from "./Section";

export function Hero() {
  const c = copy.hero;
  return (
    <Section beat="hero" className="md:pt-20">
      <p className="kicker mb-4 md:mb-6" data-reveal>{c.eyebrow}</p>
      <h1
        data-reveal
        className="font-sans text-[3rem] leading-[0.98] font-medium tracking-[-0.04em] md:text-[min(5.5rem,10.5svh)]"
      >
        {c.headline.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </h1>
      <p data-reveal className="mt-4 max-w-[34rem] text-[0.95rem] leading-relaxed text-text-2 md:mt-7 md:text-lg">
        {c.body}
      </p>
      <div data-reveal className="mt-5 md:mt-8">
        <SignupForm variant="hero" />
        <p className="mt-3 flex items-start gap-2 text-xs text-text-3 md:text-sm">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-copper" aria-hidden />
          {c.note}
        </p>
      </div>
      {/* in the text column, so it never crosses the machine on the right */}
      <p data-reveal className="meta mt-4 text-[0.62rem] text-text-4 md:mt-5 md:text-xs">
        {c.caption}
      </p>
    </Section>
  );
}
