import Image from "next/image";
import { copy } from "@/content/copy";
import { Section } from "./Section";

export function Quote() {
  const c = copy.quote;
  return (
    <Section beat="quote" align="center">
      <div className="rounded-lg bg-bg/80 p-5 backdrop-blur-md md:bg-transparent md:p-0 md:backdrop-blur-none md:text-left">
        <img src="/brand/logo-bean.svg" alt="" className="mb-5 size-7 rotate-[8deg] md:mb-8 md:size-8" data-reveal />
        <blockquote data-reveal className="text-[1.05rem] leading-[1.45] text-text md:text-[1.75rem] md:leading-[1.4]">
          {c.text}
        </blockquote>
        <div data-reveal className="mt-6 flex items-center gap-4 md:mt-9">
          <Image src="/brand/bene.jpg" alt={c.name} width={56} height={56} className="size-12 rounded-full grayscale md:size-14" />
          <div className="text-left">
            <p className="text-sm md:text-base">{c.name}</p>
            <p className="text-xs text-text-4 md:text-sm">{c.role}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
