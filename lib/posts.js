export const POSTS = [
  {
    slug: "seo-audit-checklist",
    short: "SEO audit checklist",
    title: "SEO Audit Checklist: 12 Steps to Audit Any Website (2026)",
    description: "A practical, step-by-step SEO audit checklist covering indexing, on-page, technical, Core Web Vitals, schema and AI search. Free template included.",
    date: "2026-10-01",
    updated: "2026-10-07",
    readMins: 9,
    keyword: "seo audit checklist",
    faqs: [
      ["How often should I run an SEO audit?", "Run a full audit every quarter and a quick automated scan after every major release, redesign or migration. Big sites benefit from weekly monitoring of indexing and Core Web Vitals."],
      ["How long does an SEO audit take?", "An automated scan takes under a minute per page. A full manual audit of a small business site usually takes 4–8 hours; large e-commerce sites can take several days."],
      ["Is a free SEO audit tool enough?", "A free tool catches most technical and on-page problems. Pair it with Google Search Console for real indexing and query data, and with manual review for content quality and backlinks."],
    ],
    html: `
<p>An SEO audit is a structured health check of a website that finds what stops it from ranking. Done well, it gives you a short, prioritised list of fixes rather than a 300-row spreadsheet nobody reads. This checklist is the exact order we follow, from the issues that block rankings entirely to the polish that wins the last few positions.</p>

<h2>1. Confirm Google can index the site</h2>
<p>Nothing else matters if pages aren't in the index. Search <code>site:yourdomain.com</code> for a rough count, then open the <strong>Pages</strong> report in Google Search Console. Look for three silent killers:</p>
<ul>
<li>A <code>noindex</code> meta tag or <code>X-Robots-Tag</code> header left over from staging.</li>
<li><code>Disallow: /</code> in <code>robots.txt</code>.</li>
<li>Canonical tags pointing to a different (or non-existent) URL.</li>
</ul>

<h2>2. Check robots.txt and the XML sitemap</h2>
<p>Your <code>robots.txt</code> should allow important sections, block only low-value areas (cart, admin, internal search) and end with a <code>Sitemap:</code> line. The sitemap should list only canonical, indexable URLs that return 200. Submit it in Search Console and compare "submitted" against "indexed".</p>

<h2>3. Enforce HTTPS and one canonical host</h2>
<p>Every variant (http, https, www, non-www) must 301-redirect in a single hop to one version. Redirect chains waste crawl budget and slow users down. On Cloudflare, turn on <em>Always Use HTTPS</em> and set SSL to <em>Full (strict)</em>.</p>

<h2>4. Audit title tags and meta descriptions</h2>
<p>Each page needs a unique title of roughly 50–60 characters with the primary keyword near the start, and a 140–160 character meta description that reads like ad copy. Duplicates across pages are a sign of template problems.</p>

<h2>5. Review headings and content structure</h2>
<p>Use one H1 that states the page topic, then H2s and H3s in order without skipping levels. Clear structure helps both readers and the passage-level ranking systems that power featured snippets and AI answers.</p>

<h2>6. Measure content depth and intent match</h2>
<p>Thin pages under 300 words rarely rank for anything competitive. More important than length is <strong>search intent</strong>: if Google shows comparison posts for your keyword and you have a product page, you're fighting the SERP. Search your keyword and match the dominant format.</p>

<h2>7. Check Core Web Vitals</h2>
<p>Google's page experience signals use three metrics measured from real users:</p>
<table>
<thead><tr><th>Metric</th><th>Measures</th><th>Good</th></tr></thead>
<tbody>
<tr><td>LCP</td><td>Loading of the largest element</td><td>≤ 2.5 s</td></tr>
<tr><td>INP</td><td>Responsiveness to interactions</td><td>≤ 200 ms</td></tr>
<tr><td>CLS</td><td>Visual stability</td><td>≤ 0.1</td></tr>
</tbody></table>
<p>Fast server response (TTFB under 600 ms), compressed assets, deferred scripts and images with explicit width and height fix most problems.</p>

<h2>8. Optimise images</h2>
<p>Serve WebP or AVIF, lazy-load below-the-fold images, set dimensions to stop layout shift and write descriptive alt text. Alt text is both an accessibility requirement and your entry ticket to image search.</p>

<h2>9. Fix broken links and improve internal linking</h2>
<p>Broken links leak link equity and frustrate users. Then look at internal links: your most important pages should be reachable within three clicks from the homepage and linked from relevant body copy with descriptive anchor text.</p>

<h2>10. Add structured data</h2>
<p>JSON-LD schema such as <code>Organization</code>, <code>Article</code>, <code>Product</code>, <code>FAQPage</code> and <code>BreadcrumbList</code> helps search engines understand entities and can unlock rich results. Validate it with Google's Rich Results Test.</p>

<h2>11. Prepare for AI search (GEO)</h2>
<p>AI Overviews, ChatGPT search and Perplexity cite pages that answer questions clearly. Make sure AI crawlers aren't blocked, phrase key headings as questions, answer them in the first 40–60 words and keep author and date signals visible. Read our <a href="/blog/generative-engine-optimization">GEO guide</a> for the details.</p>

<h2>12. Prioritise by impact and effort</h2>
<p>Sort every finding into a simple matrix: high impact and low effort first (a stray <code>noindex</code>, missing titles), then high impact and high effort (content rewrites, speed work), then the rest. Re-audit after shipping fixes to confirm they landed.</p>

<h2>Run this checklist automatically</h2>
<p>Steps 1–11 are exactly what <a href="/#audit">our free AI SEO auditor</a> checks in under a minute, and it uses AI to write the prioritised fix list for step 12.</p>
`,
  },
  {
    slug: "generative-engine-optimization",
    short: "What is GEO?",
    title: "What Is GEO? How to Get Cited in AI Search Results",
    description: "Generative Engine Optimization (GEO) explained: how AI search engines choose sources and 8 practical ways to get your pages cited.",
    date: "2026-09-24",
    updated: "2026-10-07",
    readMins: 7,
    keyword: "generative engine optimization",
    faqs: [
      ["Is GEO replacing SEO?", "No. AI search systems still retrieve pages through crawling and ranking, so classic SEO is the foundation. GEO adds a layer focused on being quotable and trustworthy enough to be cited."],
      ["What is llms.txt?", "llms.txt is a proposed convention: a Markdown file at the root of your site that summarises what the site is about and links to its most important pages, so language models can understand it quickly. Adoption is still early, but it's cheap to add."],
      ["Should I block GPTBot?", "Blocking GPTBot and similar crawlers keeps your content out of some AI training and search products, which also removes your chance of being cited there. Decide based on whether AI visibility or content control matters more to you."],
    ],
    html: `
<p><strong>Generative Engine Optimization (GEO)</strong> is the practice of making your content easy for AI-powered search engines to find, understand and cite in their generated answers. Where SEO aims for a blue link on page one, GEO aims for a mention and a source link inside the answer itself.</p>

<h2>How do AI search engines pick sources?</h2>
<p>Most AI search products follow a similar pattern: they rewrite the user's question into several searches, retrieve candidate pages, split those pages into passages and ask a language model to compose an answer from the most relevant passages. That means three things decide whether you are cited:</p>
<ol>
<li><strong>Retrieval:</strong> your page has to be crawlable and rank reasonably well for the sub-queries.</li>
<li><strong>Extractability:</strong> a self-contained passage on your page has to answer part of the question.</li>
<li><strong>Trust:</strong> the model prefers sources that look authoritative, current and specific.</li>
</ol>

<h2>8 ways to improve your GEO</h2>
<h3>1. Let the crawlers in</h3>
<p>Check <code>robots.txt</code> for rules that block <code>GPTBot</code>, <code>OAI-SearchBot</code>, <code>PerplexityBot</code>, <code>ClaudeBot</code> or <code>Google-Extended</code>. If they can't fetch the page, they can't cite it.</p>
<h3>2. Answer first, elaborate second</h3>
<p>Put a direct 40–60 word answer immediately under each question-style heading. This is the passage most likely to be lifted into an answer.</p>
<h3>3. Use question-style headings</h3>
<p>Headings like "How much does X cost?" map neatly onto the sub-queries AI systems generate.</p>
<h3>4. Add specifics: numbers, names and dates</h3>
<p>Vague claims are rarely quoted. Original statistics, concrete examples and clear definitions are.</p>
<h3>5. Structure with lists and tables</h3>
<p>Comparison tables and step lists are easy to extract and frequently reproduced in generated answers.</p>
<h3>6. Show E-E-A-T signals</h3>
<p>A named author with relevant experience, a visible "last updated" date and citations to primary sources all increase trust.</p>
<h3>7. Mark it up with schema</h3>
<p><code>Article</code>, <code>FAQPage</code>, <code>HowTo</code> and <code>Organization</code> schema clarify what the page is and who stands behind it.</p>
<h3>8. Publish an llms.txt</h3>
<p>A short Markdown file at <code>/llms.txt</code> that describes your site and links to key pages is a low-effort addition.</p>

<h2>Measure where you stand</h2>
<p>Our <a href="/#audit">AI SEO auditor</a> includes a dedicated AI Search (GEO) category that checks crawler access, llms.txt, question headings, extractable formatting and E-E-A-T signals, then suggests page-specific fixes.</p>
`,
  },
  {
    slug: "technical-seo-basics",
    short: "Technical SEO basics",
    title: "Technical SEO Basics: robots.txt, Sitemaps & Canonicals",
    description: "A beginner-friendly guide to the technical SEO foundations every site needs, with copy-paste examples for robots.txt, sitemaps, canonical tags and 301 redirects.",
    date: "2026-09-17",
    updated: "2026-10-07",
    readMins: 8,
    keyword: "technical seo basics",
    faqs: [
      ["What is the difference between noindex and robots.txt Disallow?", "Disallow stops crawling but a blocked URL can still be indexed from links. noindex lets the page be crawled and tells search engines not to index it. To remove a page from results, use noindex and do not block it in robots.txt."],
      ["Should every page have a canonical tag?", "Yes. A self-referencing canonical on every indexable page is a cheap safeguard against duplicates created by tracking parameters, sorting options and http/https variants."],
      ["301 or 302 redirect?", "Use 301 for permanent moves so ranking signals consolidate on the new URL. Use 302 only for genuinely temporary changes."],
    ],
    html: `
<p>Technical SEO is everything that helps search engines <strong>crawl</strong>, <strong>render</strong> and <strong>index</strong> your site. It isn't glamorous, but a single wrong line can remove a site from Google. Here are the four foundations, with examples you can copy.</p>

<h2>robots.txt</h2>
<p>A plain-text file at the root of your domain that tells crawlers where they may go.</p>
<pre><code>User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /?s=

Sitemap: https://example.com/sitemap.xml</code></pre>
<p>Keep it short. Block only areas with no search value and never block CSS or JavaScript that pages need to render.</p>

<h2>XML sitemaps</h2>
<p>A sitemap lists the URLs you want indexed. It should contain only canonical pages that return 200, be under 50,000 URLs or 50 MB per file and include accurate <code>lastmod</code> dates. WordPress generates one at <code>/wp-sitemap.xml</code>; plugins such as Yoast or Rank Math add richer versions.</p>

<h2>Canonical tags</h2>
<p>The same content often lives at several URLs (tracking parameters, filters, print versions). A canonical tag tells search engines which one is the original:</p>
<pre><code>&lt;link rel="canonical" href="https://example.com/blue-widgets/" /&gt;</code></pre>
<p>Add a self-referencing canonical to every indexable page and make sure it points to a live, indexable URL.</p>

<h2>Redirects</h2>
<p>When a URL changes, a <strong>301</strong> redirect passes users and most ranking signals to the new address. Avoid chains (A → B → C) and loops. On Nginx:</p>
<pre><code>server {
  listen 80;
  server_name example.com www.example.com;
  return 301 https://example.com$request_uri;
}</code></pre>

<h2>Bonus: the indexing checklist</h2>
<ul>
<li>One host version (https, with or without www) and everything else 301s to it.</li>
<li>No accidental <code>noindex</code> after launch.</li>
<li>A mobile viewport tag, since Google indexes the mobile version.</li>
<li>Clean, lowercase, hyphenated URLs.</li>
</ul>
<p>Not sure where your site stands? Run a <a href="/#audit">free technical SEO audit</a>; it checks all of the above in seconds.</p>
`,
  },
];

export const getPost = (slug) => POSTS.find((p) => p.slug === slug);
