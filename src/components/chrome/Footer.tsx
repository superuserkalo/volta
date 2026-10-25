import { copy } from "@/content/copy";
import { notices } from "@/content/allowed-edits";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-12 lg:px-[7.5rem]">
        <Logo className="h-5 w-auto self-start text-text md:h-6 md:self-auto" />
        <nav className="flex gap-6 md:gap-10">
          {copy.footer.links.map((l) => (
            <a key={l.href} href={l.href} className="meta text-xs text-text-2 hover:text-copper md:text-sm" target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="text-xs text-text-4 md:text-right md:text-sm">
          <p>{copy.footer.legal}</p>
          <p className="mt-1">{notices.footer}</p>
        </div>
      </div>
    </footer>
  );
}
