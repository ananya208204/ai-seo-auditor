import Link from "next/link";
import { SITE } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label={`${SITE.name} home`}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-paper">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.4" />
          <path d="M15.5 15.5 21 21" stroke="var(--accent)" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </span>
      {SITE.name}
    </Link>
  );
}

const NAV = [
  ["/#features", "Features"],
  ["/#how", "How it works"],
  ["/pricing", "Pricing"],
  ["/blog", "Blog"],
  ["/about", "About"],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-ink-2 md:flex" aria-label="Main">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-ink">{label}</Link>
          ))}
        </nav>
        <Link href="/#audit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-90">
          Run free audit
        </Link>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-line px-4 py-2 text-sm text-ink-2 md:hidden" aria-label="Mobile">
        {NAV.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap">{label}</Link>
        ))}
      </nav>
    </header>
  );
}
