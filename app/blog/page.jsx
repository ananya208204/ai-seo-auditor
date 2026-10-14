import { og } from "@/lib/site";
import Link from "next/link";
import { POSTS } from "@/lib/posts";

export const metadata = {
  title: "SEO Blog: Audit, Technical & AI Search Guides",
  description: "Practical guides on SEO audits, technical SEO, Core Web Vitals and Generative Engine Optimization (GEO) for AI search.",
  alternates: { canonical: "/blog" },
  get openGraph() { return og("/blog", this.title, this.description); },
};

export default function Blog() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <p className="eyebrow">Blog</p>
      <h1 className="display mt-3 text-6xl">SEO guides that get to the point.</h1>
      <div className="mt-14 divide-y divide-line border-y border-line">
        {POSTS.map((p) => (
          <article key={p.slug} className="py-8">
            <p className="font-mono text-xs text-ink-3">
              <time dateTime={p.date}>{new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time> · {p.readMins} min read
            </p>
            <h2 className="mt-2 text-2xl font-semibold"><Link href={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link></h2>
            <p className="mt-2 text-ink-2">{p.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
