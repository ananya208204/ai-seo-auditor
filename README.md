# Crawlwise AI: AI SEO Website Auditor

Next.js 16 app that audits any public URL for 40+ SEO issues across 7 categories and uses OpenAI to write a prioritised fix list, title/meta rewrites, keyword ideas and JSON-LD.

## Run locally
```bash
npm install
cp .env.example .env.local      # add OPENAI_API_KEY
npm run dev                     # http://localhost:3000
```
No API key? Audits still work and show rule-based fixes.
To audit pages on localhost while developing: `AUDIT_ALLOW_PRIVATE=1 npm run dev` (ignored in production).

## Production
```bash
npm run build && npm start
```
Full VPS + Cloudflare + SSL guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Project research write-up: [docs/MILESTONE-1.md](docs/MILESTONE-1.md).

## Structure
```
app/
  page.jsx               Landing page (tool, features, FAQ + schema)
  audit/page.jsx         Report page (client, noindex)
  api/audit/route.js     POST {url, keyword} → audit + AI insights (rate-limited 10/hr/IP)
  blog/, pricing/, about/, privacy/
  sitemap.js, robots.js, opengraph-image.jsx, icon.svg
components/              Header, Footer, AuditForm, Report
lib/
  fetcher.js             Safe fetch: SSRF guard on every redirect hop, timeouts, 5 MB cap
  audit.js               All checks + weighted scoring
  ai.js                  OpenAI JSON-mode prompt + rule-based fallback
  posts.js               Blog content
  site.js                Brand name, URL, email (rename here)
public/llms.txt
```

## Checks
| Category | Examples |
|---|---|
| Meta & Indexing | title, meta description, canonical, noindex, lang, charset, favicon, hreflang |
| Content | H1, heading hierarchy, word count, text/HTML ratio, Flesch readability, target-keyword placement |
| Technical | HTTPS, HTTP→HTTPS redirect, redirect chain, status, robots.txt, sitemap, viewport, URL format |
| Performance | TTFB, HTML size, compression, render-blocking resources, script count, caching |
| Links & Images | broken links (25 sampled), internal links, empty anchors, alt text, dimensions, lazy loading, WebP/AVIF |
| Social & Schema | Open Graph, Twitter card, JSON-LD types and validity |
| AI Search (GEO) | AI-crawler access in robots.txt, llms.txt, question headings, lists/tables/FAQ, author + date signals |

Score = impact-weighted pass rate per category (high 3, medium 2, low 1; warning = half), combined by category weight.
