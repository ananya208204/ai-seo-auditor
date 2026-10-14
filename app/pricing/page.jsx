import { og } from "@/lib/site";
import Link from "next/link";

export const metadata = {
  title: "Pricing: Free & Pro SEO Audit Plans",
  description: "Start with free AI SEO audits. Upgrade for full-site crawls, weekly monitoring, white-label PDF reports and API access.",
  alternates: { canonical: "/pricing" },
  get openGraph() { return og("/pricing", this.title, this.description); },
};

const PLANS = [
  { name: "Free", price: "$0", per: "forever", cta: "Run free audit", href: "/#audit", features: ["10 single-page audits / hour", "40+ SEO checks", "AI-written fix list", "Title, meta & schema suggestions", "PDF & JSON export"] },
  { name: "Pro", price: "$19", per: "/month", cta: "Start 14-day trial", href: "mailto:hello@crawlwise.ai?subject=Pro%20trial", featured: true, features: ["Everything in Free", "Full-site crawl up to 500 pages", "Weekly monitoring & email alerts", "Keyword tracking for 50 terms", "Google Search Console integration", "Priority AI model"] },
  { name: "Agency", price: "$79", per: "/month", cta: "Talk to us", href: "mailto:hello@crawlwise.ai?subject=Agency%20plan", features: ["Everything in Pro", "Up to 25 client sites", "White-label PDF reports", "Team seats & client sharing", "REST API access"] },
];

export default function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <p className="eyebrow">Pricing</p>
      <h1 className="display mt-3 max-w-3xl text-6xl">Free to audit. Pay when you need to monitor.</h1>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <section key={p.name} className={`flex flex-col rounded-3xl border p-7 ${p.featured ? "border-ink bg-card shadow-[8px_8px_0_var(--ink)]" : "border-line bg-card"}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              {p.featured && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-ink">Most popular</span>}
            </div>
            <p className="mt-6"><span className="display text-6xl">{p.price}</span> <span className="text-ink-3">{p.per}</span></p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {p.features.map((f) => (<li key={f} className="flex gap-2"><span className="text-pass">✓</span>{f}</li>))}
            </ul>
            <Link href={p.href} className={`mt-8 rounded-full px-5 py-3 text-center font-semibold ${p.featured ? "bg-ink text-paper" : "border border-ink"}`}>{p.cta}</Link>
          </section>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-ink-3">Prices in USD. Student and non-profit discounts available on request.</p>
    </div>
  );
}
