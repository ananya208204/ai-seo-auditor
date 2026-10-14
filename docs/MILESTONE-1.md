# Milestone I: Research, Strategy & Cloud Deployment
**Project:** Crawlwise AI, an AI SEO Website Auditor
**Author:** Yasir Khan

> Fill the `[ ]` cells with numbers from Google Keyword Planner / Ubersuggest / Ahrefs Free Keyword Generator before submitting. Volumes and difficulty are deliberately not invented here.

---

## 1. Niche, Target Audience & SEO Problem Identification (2 marks)

**Niche:** SEO SaaS tools, specifically *free, AI-assisted website auditing*.

**Target audience**
| Segment | Who | Main need |
|---|---|---|
| Small-business owners | Local shops, clinics, agencies with a WordPress/Wix site | "Why am I not on Google?" in plain language |
| Freelance developers | Build client sites, need a pre-launch SEO check | Fast technical checklist + fixes they can paste |
| Students & junior marketers | Learning SEO | A tool that explains *why*, not just *what* |
| Content teams | Publishing blog posts | Keyword placement, meta rewrites, AI-search readiness |

**SEO problems the product solves**
1. Existing audit tools output long, unprioritised issue lists that non-experts can't act on.
2. Generic advice ("improve your title") instead of a rewritten title for *this* page.
3. Almost no free tools check **AI-search readiness (GEO)**: AI-crawler access, llms.txt, question headings, E-E-A-T signals.
4. Paid tools (Ahrefs, Semrush) are priced for agencies, not individuals.

**Unique value proposition:** *Free audit → AI-prioritised fixes → ready-to-paste title, meta and schema, including GEO checks.*

---

## 2. Keyword Research, LSI & Search Intent Mapping (2 marks)

### Primary & secondary keywords
| Keyword | Intent | Target page | Volume | KD |
|---|---|---|---|---|
| ai seo audit | Commercial | `/` | [ ] | [ ] |
| free seo audit tool | Commercial/Transactional | `/` | [ ] | [ ] |
| website seo checker | Transactional | `/` | [ ] | [ ] |
| seo audit checklist | Informational | `/blog/seo-audit-checklist` | [ ] | [ ] |
| generative engine optimization | Informational | `/blog/generative-engine-optimization` | [ ] | [ ] |
| technical seo basics | Informational | `/blog/technical-seo-basics` | [ ] | [ ] |
| seo audit tool pricing | Commercial | `/pricing` | [ ] | [ ] |

### Long-tail keywords
- how to do an seo audit for a website
- free seo audit tool without sign up
- check if chatgpt can crawl my website
- what is llms.txt
- how to fix missing meta description
- seo checker for wordpress site

### LSI / semantically related terms (used in page copy and headings)
technical SEO, on-page SEO, crawlability, indexability, meta description, title tag, canonical tag, robots.txt, XML sitemap, Core Web Vitals, LCP, INP, CLS, schema markup, JSON-LD, structured data, broken links, alt text, page speed, E-E-A-T, AI Overviews, Perplexity, GEO, search intent.

### Search intent → page mapping
| Intent | User mindset | Page type | Built page |
|---|---|---|---|
| Transactional | "Audit my site now" | Tool landing page with form above the fold | `/` |
| Commercial | "Which tool / how much?" | Pricing + comparison | `/pricing` |
| Informational | "How do I…/What is…" | Long-form guide with FAQ schema | `/blog/*` |
| Navigational | "Crawlwise AI" | Brand pages | `/about` |

---

## 3. Competitor Analysis & SERP Breakdown (4 marks)

> Search each primary keyword in an incognito window (google.co.in and google.com), record the top 10 and update this section with what you actually see. Pricing changes often, so verify on each site.

### Direct competitors
| Competitor | Strengths | Weaknesses / gap we exploit |
|---|---|---|
| SEOptimer | Clean one-page audit, PDF reports, strong brand for "seo audit" | Generic recommendations; limited AI-search checks |
| Seobility | Free crawler with multi-page checks | Dense UI, aimed at SEO professionals |
| Sitechecker | Good on-page checker, Chrome extension | Most depth behind paywall |
| SEO Site Checkup | Long-standing tool, many checks | Dated UX, list-heavy output |
| Semrush / Ahrefs site audit | Industry-leading data and crawlers | Expensive, account required, overkill for small sites |
| Google PageSpeed Insights / Lighthouse | Free, authoritative CWV data | Performance-focused; not a full SEO or GEO audit |

### SERP breakdown (template; fill from live search)
| Keyword | SERP features seen | Dominant page type | Avg. content length of top 3 | Our angle |
|---|---|---|---|---|
| free seo audit tool | [ads, sitelinks, PAA?] | Tool landing pages | [ ] | Tool above the fold + FAQ schema |
| seo audit checklist | [featured snippet? PAA?] | Listicle guides | [ ] | 12-step numbered list + table, FAQ schema |
| generative engine optimization | [AI Overview? PAA?] | Explainers | [ ] | Question headings + concise definitions |

### Takeaways
- Transactional SERPs reward an **instant tool above the fold**, so the homepage hero *is* the form.
- Informational SERPs show People Also Ask, so every guide ends with an FAQ block + `FAQPage` schema.
- GEO is under-served by competitors and is our content and feature differentiator.

---

## 4. Project Design & SEO Implementation Roadmap (4 marks)

### Information architecture
```
/                         Tool + features + FAQ (FAQPage, SoftwareApplication schema)
├── /audit?url=           Report (noindex, generated per request)
├── /pricing
├── /blog
│   ├── /seo-audit-checklist           (BlogPosting, BreadcrumbList, FAQPage)
│   ├── /generative-engine-optimization
│   └── /technical-seo-basics
├── /about                (Person schema → E-E-A-T)
├── /privacy
├── /robots.txt  /sitemap.xml  /llms.txt  /opengraph-image
```

### On-page SEO already implemented
- Unique titles ≤ 60 chars and meta descriptions ≤ 160 chars per page
- Self-referencing canonicals, Open Graph + Twitter cards, auto-generated OG image
- One H1 per page, logical H2/H3 hierarchy, question-style headings on guides
- JSON-LD: Organization, WebSite, SoftwareApplication, FAQPage, BlogPosting, BreadcrumbList, Person
- Internal links: footer guides, related posts, in-content links to the tool
- Visible author and published/updated dates on every article
- Security headers (HSTS, nosniff, frame options, referrer policy)
- Static generation for content pages (fast TTFB), mobile-first responsive layout

### Roadmap
| Phase | Weeks | Deliverables |
|---|---|---|
| 1. Research | 1–2 | Niche, keywords, competitor + SERP analysis (this doc) |
| 2. Build & deploy | 3–4 | Next.js app, audit engine, VPS + Cloudflare + SSL, Search Console + sitemap |
| 3. Content | 5–8 | 6–8 more guides targeting long-tail keywords; internal-link hub on `/blog` |
| 4. Off-page | 6–10 | Backlinks: Product Hunt, dev.to / Hashnode cross-posts, SaaS directories, guest posts, Reddit/Quora answers |
| 5. Measure | ongoing | GSC impressions/CTR, GA4 audits run, Core Web Vitals, rank tracking for primary keywords |

### KPIs
Indexed pages · impressions and CTR (GSC) · rankings for 7 primary keywords · audits run per week · referring domains.

---

## 5. VPS Setup, Cloudflare DNS, SSL & Deployment (4 marks)
See **[DEPLOYMENT.md](./DEPLOYMENT.md)**. Add screenshots of: Cloudflare DNS records, SSL mode = Full (strict), `pm2 status`, the live site with padlock, and Search Console sitemap "Success".
