import { copy } from "@/content/copy";

export function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12 md:py-7 lg:px-[7.5rem]">
        <a href="#hero" className="chrome-logo pointer-events-auto" aria-label="VOLTA">
          <img src="/brand/logo-volta.svg" alt="VOLTA" className="h-5 w-auto md:h-7" />
        </a>
        <a
          href="#cta"
          className="chrome-cta meta pointer-events-auto rounded-md border border-text/40 px-3 py-2 text-[0.68rem] text-text transition-colors hover:border-copper hover:text-copper md:px-6 md:py-3 md:text-sm"
        >
          {copy.nav.cta}
        </a>
      </div>
    </header>
  );
}
