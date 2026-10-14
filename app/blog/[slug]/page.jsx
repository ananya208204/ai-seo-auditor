import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/lib/posts";
import { SITE } from "@/lib/site";
import AuditForm from "@/components/AuditForm";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: { absolute: p.title },
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    authors: [{ name: SITE.author }],
    openGraph: { type: "article", url: `/blog/${p.slug}`, images: ["/opengraph-image"], title: p.title, description: p.description, publishedTime: p.date, modifiedTime: p.updated, authors: [SITE.author] },
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated,
      author: { "@type": "Person", name: SITE.author, url: `${SITE.url}/about` },
      publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` } },
      mainEntityOfPage: `${SITE.url}/blog/${p.slug}`,
      keywords: p.keyword,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
        { "@type": "ListItem", position: 3, name: p.title, item: `${SITE.url}/blog/${p.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-ink-3">
        <Link href="/">Home</Link> / <Link href="/blog">Blog</Link>
      </nav>
      <h1 className="display mt-4 text-5xl sm:text-6xl">{p.title}</h1>
      <p className="mt-6 flex flex-wrap gap-x-3 text-sm text-ink-3">
        <span>By <Link href="/about" rel="author" className="text-ink underline underline-offset-4">{SITE.author}</Link></span>
        <span>Published <time dateTime={p.date}>{fmt(p.date)}</time></span>
        <span>Updated <time dateTime={p.updated}>{fmt(p.updated)}</time></span>
        <span>{p.readMins} min read</span>
      </p>
      <div className="prose-article mt-10" dangerouslySetInnerHTML={{ __html: p.html }} />

      <section className="mt-12 border-t border-line pt-10">
        <h2 className="display text-4xl">Frequently asked questions</h2>
        {p.faqs.map(([q, a]) => (
          <div key={q} className="mt-6">
            <h3 className="font-semibold">{q}</h3>
            <p className="mt-1 text-ink-2">{a}</p>
          </div>
        ))}
      </section>

      <aside className="mt-14 rounded-3xl border border-ink bg-card p-6 sm:p-8">
        <p className="display text-3xl">Audit your site now</p>
        <p className="mt-2 text-ink-2">Check everything in this guide automatically, free.</p>
        <div className="mt-6"><AuditForm compact /></div>
      </aside>

      <nav className="mt-14" aria-label="More guides">
        <p className="eyebrow">Keep reading</p>
        <ul className="mt-3 space-y-2">
          {POSTS.filter((x) => x.slug !== p.slug).map((x) => (
            <li key={x.slug}><Link href={`/blog/${x.slug}`} className="underline decoration-line underline-offset-4 hover:decoration-ink">{x.title}</Link></li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
