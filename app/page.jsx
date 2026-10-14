import Link from "next/link";
import AuditForm from "@/components/AuditForm";
import { SITE, og } from "@/lib/site";
import { POSTS } from "@/lib/posts";

export const metadata = { alternates: { canonical: "/" }, openGraph: og("/", `${SITE.name}: Free AI SEO Website Auditor`, SITE.description) };

const FEATURES = [
  ["01", "Meta & Indexing", "Titles, descriptions, canonicals, noindex traps, lang and favicon. The things that decide whether you appear at all."],
  ["02", "Content", "Word count, H1 and heading hierarchy, readability, keyword placement and density for your target term."],
  ["03", "Technical", "HTTPS, redirect chains, robots.txt, XML sitemap, mobile viewport and URL hygiene."],
  ["04", "Performance", "Server response time, HTML weight, compression, caching and render-blocking scripts that hurt Core Web Vitals."],
  ["05", "Links & Images", "Broken-link checks, internal linking, anchor text, alt text, lazy loading and modern image formats."],
  ["06", "Social & Schema", "Open Graph, Twitter cards and JSON-LD structured data detection for rich results."],
  ["07", "AI Search (GEO)", "AI-crawler access, llms.txt, question headings and E-E-A-T signals that get you cited by ChatGPT and Perplexity."],
];

const FAQS = [
  ["What is an AI SEO website auditor?", `An AI SEO website auditor crawls a page, runs automated checks for technical, on-page and content issues, then uses a language model to turn those findings into a prioritised, page-specific action plan, including rewritten titles, meta descriptions and schema markup.`],
  ["Is the SEO audit really free?", "Yes. You can run up to 10 full audits per hour without an account. Paid plans add whole-site crawls, scheduled monitoring and white-label PDF reports."],
  ["How is this different from other SEO checkers?", "Most checkers stop at a list of red and green ticks. We also explain why each issue matters for your page, write the fix for you, and audit AI-search readiness (GEO), which most tools still ignore."],
  ["Does the audit check Core Web Vitals?", "We measure lab signals that drive Core Web Vitals: server response time, HTML size, compression, render-blocking resources and image dimensions. For real-user field data, connect Google Search Console or PageSpeed Insights."],
  ["Do you store the websites I audit?", "No. Audits run on demand and results are not saved to a database. Page content is sent to our AI provider only to generate recommendations."],
  ["Can I audit a WordPress site?", "Yes. The auditor works on any public website: WordPress, Shopify, Next.js, Webflow or hand-coded HTML."],
];

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE.url,
    description: SITE.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, appSchema]) }} />

      {/* HERO */}
      <section id="audit" className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="eyebrow mb-5">AI SEO Website Auditor · 40+ checks</p>
            <h1 className="display text-[3.1rem] sm:text-7xl">
              Find what’s holding your site back. <em className="hl not-italic">Fix it with AI.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-2">
              Paste a URL and get a free SEO audit covering technical health, on-page content, speed and AI-search readiness, with a prioritised fix list written for your exact page.
            </p>
            <div className="mt-8 max-w-xl"><AuditForm /></div>
          </div>
          <SampleCard />
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-line bg-paper-2">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 text-center sm:grid-cols-4">
          {[["40+", "SEO checks per page"], ["7", "audit categories"], ["~30s", "average audit time"], ["0", "sign-ups required"]].map(([n, l]) => (
            <div key={l}><dt className="display text-4xl">{n}</dt><dd className="mt-1 text-sm text-ink-3">{l}</dd></div>
          ))}
        </dl>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <p className="eyebrow">What we check</p>
        <h2 className="display mt-3 max-w-3xl text-5xl">A complete SEO health check, from crawlability to AI citations.</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([n, t, d]) => (
            <article key={n} className="bg-card p-6">
              <span className="font-mono text-xs text-ink-3">{n}</span>
              <h3 className="mt-6 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{d}</p>
            </article>
          ))}
          <article className="flex flex-col justify-between bg-ink p-6 text-paper">
            <span className="font-mono text-xs opacity-60">+ AI</span>
            <div>
              <h3 className="mt-6 text-lg font-semibold">AI-written fixes</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-75">Rewritten title and meta, keyword ideas, content gaps and ready-to-paste JSON-LD.</p>
            </div>
          </article>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="scroll-mt-20 bg-ink py-24 text-paper">
        <div className="mx-auto max-w-6xl px-4">
          <p className="eyebrow !text-paper/50">How it works</p>
          <h2 className="display mt-3 text-5xl">Three steps. No spreadsheet required.</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              ["Enter your URL", "Add an optional target keyword to check placement in your title, H1, meta and slug."],
              ["We crawl and score", "Our crawler fetches the page, robots.txt, sitemap and llms.txt, tests links and scores 7 categories out of 100."],
              ["AI writes the plan", "A language model reads the findings and your content, then ranks fixes by impact and effort and drafts the copy."],
            ].map(([t, d], i) => (
              <li key={t} className="border-t border-paper/20 pt-6">
                <span className="display text-6xl text-accent">{i + 1}</span>
                <h3 className="mt-4 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-paper/70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Not just a checklist</p>
            <h2 className="display mt-3 text-5xl">It tells you what to change, and writes it.</h2>
            <p className="mt-5 text-lg text-ink-2">Generic advice like “improve your title tag” wastes time. Every recommendation is grounded in your page’s actual content, headings and keyword usage.</p>
          </div>
          <div className="space-y-4 font-mono text-sm">
            <div className="rounded-xl border border-line bg-card p-5">
              <p className="mb-2 text-xs uppercase tracking-widest text-fail">Before · 78 chars</p>
              <p className="text-ink-2 line-through decoration-fail/60">Home | Acme Plumbing Services Company LLC | Best Plumbers | Call Us Today!!</p>
            </div>
            <div className="rounded-xl border border-ink bg-card p-5 shadow-[4px_4px_0_var(--accent)]">
              <p className="mb-2 text-xs uppercase tracking-widest text-pass">AI rewrite · 56 chars</p>
              <p>Emergency Plumber in Austin, TX | 24/7 | Acme Plumbing</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="display mt-3 text-5xl">Questions about SEO audits</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                  <h3>{q}</h3>
                  <span className="font-mono text-ink-3 transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-ink-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="display text-4xl">SEO guides</h2>
          <Link href="/blog" className="text-sm underline underline-offset-4">All articles →</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {POSTS.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-2xl border border-line bg-card p-6 transition hover:border-ink">
              <p className="font-mono text-xs text-ink-3">{p.readMins} min read</p>
              <h3 className="mt-3 text-lg font-semibold leading-snug group-hover:underline">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-2">{p.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-6xl px-4">
        <div className="rounded-3xl bg-accent px-6 py-14 text-center text-accent-ink sm:px-12">
          <h2 className="display text-5xl sm:text-6xl">What’s your SEO score?</h2>
          <p className="mx-auto mt-4 max-w-lg opacity-80">Find out in about 30 seconds. Free, no account needed.</p>
          <Link href="/#audit" className="mt-8 inline-block rounded-full bg-ink px-7 py-3.5 font-semibold text-paper">Run a free audit</Link>
        </div>
      </section>
    </>
  );
}

function SampleCard() {
  const cats = [["Meta & Indexing", 92], ["Content", 64], ["Technical", 88], ["Performance", 71], ["AI Search (GEO)", 45]];
  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      <div className="rotate-[1.5deg] rounded-2xl border border-ink bg-card p-6 shadow-[10px_10px_0_var(--ink)]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-3">example.com/pricing</span>
          <span className="rounded-full bg-paper-2 px-2 py-0.5 font-mono text-xs">Grade C</span>
        </div>
        <div className="mt-5 flex items-end gap-3">
          <span className="display text-8xl">74</span>
          <span className="mb-3 text-ink-3">/ 100</span>
        </div>
        <div className="mt-5 space-y-3">
          {cats.map(([l, v]) => (
            <div key={l}>
              <div className="flex justify-between text-xs"><span>{l}</span><span className="font-mono">{v}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-paper-2">
                <div className="h-full rounded-full" style={{ width: `${v}%`, background: v >= 80 ? "var(--pass)" : v >= 60 ? "var(--warn)" : "var(--fail)" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-lg bg-ink p-3 font-mono text-xs text-paper">
          <span className="text-accent">AI ›</span> Fix #1: add a self-referencing canonical, then rewrite the title to 55 chars…
        </div>
      </div>
    </div>
  );
}
