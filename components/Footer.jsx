import Link from "next/link";
import { Logo } from "./Header";
import { SITE } from "@/lib/site";
import { POSTS } from "@/lib/posts";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-ink-2">{SITE.description}</p>
        </div>
        <div>
          <p className="eyebrow mb-3">Product</p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li><Link href="/#audit">Free SEO audit</Link></li>
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Guides</p>
          <ul className="space-y-2 text-sm text-ink-2">
            {POSTS.map((p) => (<li key={p.slug}><Link href={`/blog/${p.slug}`}>{p.short}</Link></li>))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Company</p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-xs text-ink-3">
        © {new Date().getFullYear()} {SITE.name}. Built by {SITE.author}.
      </div>
    </footer>
  );
}
