import * as cheerio from "cheerio";
import { normalizeUrl, safeFetch, tryFetch } from "./fetcher";

export const CATEGORIES = {
  meta: { label: "Meta & Indexing", weight: 20 },
  content: { label: "Content", weight: 20 },
  technical: { label: "Technical", weight: 20 },
  performance: { label: "Performance", weight: 15 },
  links: { label: "Links & Images", weight: 10 },
  social: { label: "Social & Schema", weight: 8 },
  geo: { label: "AI Search (GEO)", weight: 7 },
};

const STOP = new Set(
  "a an and are as at be but by for from has have he her his i in is it its of on or our she that the their them they this to was we were will with you your not can all more about which when what who how also into than then there these those so if no do does did been being up out over just any such may each other only our its use using new one two get like make most very".split(" ")
);

const check = (category, id, title, status, value, fix, impact = "medium") => ({ category, id, title, status, value, fix, impact });

function syllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const m = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

function readability(text) {
  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim().split(/\s+/).length > 2);
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (sentences.length < 3 || words.length < 50) return null;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return Math.round(206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syl / words.length));
}

function topKeywords(text, n = 12) {
  const words = text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
  const counts = new Map();
  const bump = (k) => counts.set(k, (counts.get(k) || 0) + 1);
  const clean = words.filter((w) => !STOP.has(w));
  clean.forEach(bump);
  for (let i = 0; i < clean.length - 1; i++) bump(clean[i] + " " + clean[i + 1]);
  const total = words.length || 1;
  return [...counts.entries()]
    .filter(([k, c]) => c >= (k.includes(" ") ? 3 : 2))
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([term, count]) => ({ term, count, density: +((count / total) * 100).toFixed(2) }));
}

/** True if robots.txt fully disallows `agent` (its own group, else the * group). */
function robotsBlocks(txt, agent) {
  if (!txt) return false;
  const groups = [];
  let cur = null, lastWasUA = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase(), val = m[2].trim();
    if (key === "user-agent") {
      if (!lastWasUA || !cur) groups.push((cur = { agents: [], rules: [] }));
      cur.agents.push(val.toLowerCase());
      lastWasUA = true;
    } else {
      lastWasUA = false;
      if (cur && (key === "disallow" || key === "allow")) cur.rules.push({ key, val });
    }
  }
  const a = agent.toLowerCase();
  const group = groups.find((g) => g.agents.includes(a)) || (a !== "*" ? groups.find((g) => g.agents.includes("*")) : null) || groups.find((g) => g.agents.includes("*"));
  if (!group) return false;
  return group.rules.some((r) => r.key === "disallow" && r.val === "/") && !group.rules.some((r) => r.key === "allow" && r.val === "/");
}

async function checkLinks(urls) {
  const sample = urls.slice(0, 25);
  const results = await Promise.all(
    sample.map(async (u) => {
      let r = await tryFetch(u, { method: "HEAD", readBody: false, timeout: 6000 });
      if (!r || r.status === 405 || r.status === 403) r = await tryFetch(u, { readBody: false, timeout: 6000 });
      return { url: u, status: r ? r.status : 0 };
    })
  );
  return { checked: sample.length, broken: results.filter((r) => r.status === 0 || r.status >= 400) };
}

export async function runAudit(rawUrl, targetKeyword = "") {
  const input = normalizeUrl(rawUrl);
  const page = await safeFetch(input);
  const ctype = page.headers["content-type"] || "";
  if (page.status >= 400 && !ctype.includes("html")) throw new Error(`The site responded with HTTP ${page.status}${page.status === 403 ? " (it may be blocking automated requests or behind a firewall)" : ""}.`);
  if (!ctype.includes("html")) throw new Error(`The URL returned ${ctype || "non-HTML content"}, not a web page.`);

  const final = new URL(page.url);
  const origin = final.origin;
  const [robots, llms, httpVariant] = await Promise.all([
    tryFetch(`${origin}/robots.txt`),
    tryFetch(`${origin}/llms.txt`),
    final.protocol === "https:" ? tryFetch(`http://${final.host}${final.pathname}`, { readBody: false }) : null,
  ]);
  const robotsTxt = robots && robots.status === 200 && !/<html/i.test(robots.body) ? robots.body : "";
  const sitemapRef = (robotsTxt.match(/^\s*sitemap:\s*(\S+)/im) || [])[1];
  const sitemap = await tryFetch(sitemapRef || `${origin}/sitemap.xml`);
  const sitemapOk = sitemap && sitemap.status === 200 && /<(urlset|sitemapindex)/i.test(sitemap.body);
  const sitemapUrls = sitemapOk ? (sitemap.body.match(/<loc>/gi) || []).length : 0;

  const $ = cheerio.load(page.body);
  const H = page.headers;
  const checks = [];
  const add = (...a) => checks.push(check(...a));

  // ---------- META & INDEXING ----------
  const title = $("head title").first().text().trim();
  const titleCount = $("head title").length;
  const desc = ($('meta[name="description" i]').attr("content") || "").trim();
  const canonical = $('link[rel="canonical" i]').attr("href") || "";
  const robotsMeta = ($('meta[name="robots" i]').attr("content") || "").toLowerCase();
  const xRobots = (H["x-robots-tag"] || "").toLowerCase();
  const lang = $("html").attr("lang") || "";
  const viewport = $('meta[name="viewport" i]').attr("content") || "";
  const charset = $("meta[charset]").length || /charset/i.test($('meta[http-equiv="Content-Type" i]').attr("content") || "");
  const favicon = $('link[rel~="icon" i]').length > 0;
  const hreflang = $('link[rel="alternate"][hreflang]').length;

  if (!title) add("meta", "title", "Title tag", "fail", "Missing", "Add a unique <title> of 50–60 characters with the primary keyword near the start.", "high");
  else if (title.length < 30 || title.length > 60)
    add("meta", "title", "Title tag", "warn", `${title.length} chars: “${title}”`, `Rewrite the title to 50–60 characters (now ${title.length}) so it isn't ${title.length > 60 ? "truncated" : "under-used"} in Google results.`, "high");
  else add("meta", "title", "Title tag", "pass", `${title.length} chars: “${title}”`, "");
  if (titleCount > 1) add("meta", "title-dup", "Single title tag", "warn", `${titleCount} title tags`, "Keep exactly one <title> in <head>.", "low");

  if (!desc) add("meta", "description", "Meta description", "fail", "Missing", "Add a 140–160 character meta description that summarises the page and ends with a reason to click.", "high");
  else if (desc.length < 70 || desc.length > 160)
    add("meta", "description", "Meta description", "warn", `${desc.length} chars`, `Adjust the meta description to 140–160 characters (now ${desc.length}).`, "medium");
  else add("meta", "description", "Meta description", "pass", `${desc.length} chars`, "");

  if (!canonical) add("meta", "canonical", "Canonical URL", "warn", "Missing", `Add <link rel="canonical" href="${final.href}"> to prevent duplicate-content dilution.`, "medium");
  else {
    let abs = canonical;
    try { abs = new URL(canonical, final).href; } catch {}
    const self = abs.replace(/\/$/, "") === final.href.replace(/\/$/, "");
    add("meta", "canonical", "Canonical URL", self ? "pass" : "warn", abs, self ? "" : "Canonical points to a different URL. Confirm this is intentional; otherwise make it self-referencing.", "medium");
  }

  const noindex = robotsMeta.includes("noindex") || xRobots.includes("noindex");
  add("meta", "indexable", "Indexable by search engines", noindex ? "fail" : "pass", noindex ? "noindex directive found" : "No noindex directive", noindex ? "Remove the noindex directive (meta robots or X-Robots-Tag) if this page should rank." : "", "high");
  add("meta", "lang", "HTML lang attribute", lang ? "pass" : "warn", lang || "Missing", lang ? "" : 'Add lang to <html>, e.g. <html lang="en">.', "low");
  add("meta", "charset", "Character encoding", charset ? "pass" : "warn", charset ? "Declared" : "Missing", charset ? "" : 'Add <meta charset="utf-8"> as the first element in <head>.', "low");
  add("meta", "favicon", "Favicon", favicon ? "pass" : "warn", favicon ? "Present" : "Missing", favicon ? "" : "Add a favicon; Google shows it next to mobile results.", "low");
  if (hreflang) add("meta", "hreflang", "Hreflang tags", "pass", `${hreflang} alternates`, "");

  // ---------- CONTENT ----------
  // Separate adjacent elements with spaces so text from <h1>A</h1><p>B</p> doesn't merge into "AB"
  const $body = cheerio.load(page.body.replace(/</g, " <"))("body");
  $body.find("script,style,noscript,svg,template,iframe").remove();
  const text = $body.text().replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  const h1s = $("h1").map((_, e) => $(e).text().trim()).get();
  const headings = $("h1,h2,h3,h4,h5,h6").map((_, e) => ({ level: +e.tagName[1], text: $(e).text().trim().slice(0, 120) })).get();
  const ratio = page.body.length ? +((text.length / page.body.length) * 100).toFixed(1) : 0;
  const flesch = readability(text);
  const keywords = topKeywords(text);

  if (!h1s.length) add("content", "h1", "H1 heading", "fail", "Missing", "Add one H1 that states the page topic and includes the primary keyword.", "high");
  else if (h1s.length > 1) add("content", "h1", "H1 heading", "warn", `${h1s.length} H1 tags`, "Use a single H1 and demote the rest to H2.", "medium");
  else add("content", "h1", "H1 heading", "pass", `“${h1s[0].slice(0, 80)}”`, "");

  let skipped = false;
  for (let i = 1; i < headings.length; i++) if (headings[i].level - headings[i - 1].level > 1) skipped = true;
  add("content", "hierarchy", "Heading hierarchy", skipped ? "warn" : headings.length > 2 ? "pass" : "warn",
    `${headings.length} headings${skipped ? ", levels skipped" : ""}`,
    skipped ? "Don't skip heading levels (e.g. H2 → H4); it confuses screen readers and crawlers." : headings.length > 2 ? "" : "Break the content into H2/H3 sections so search engines and AI can extract passages.", "medium");

  add("content", "wordcount", "Content depth", words >= 600 ? "pass" : words >= 300 ? "warn" : "fail", `${words.toLocaleString()} words`,
    words >= 600 ? "" : `Expand to 600+ words of useful, original content (now ${words}). Thin pages rarely rank.`, words < 300 ? "high" : "medium");
  add("content", "ratio", "Text-to-HTML ratio", ratio >= 10 ? "pass" : "warn", `${ratio}%`, ratio >= 10 ? "" : "Reduce markup bloat (inline CSS/JS, nested wrappers) or add more visible text.", "low");
  if (flesch !== null)
    add("content", "readability", "Readability (Flesch)", flesch >= 50 ? "pass" : "warn", `${flesch} / 100`, flesch >= 50 ? "" : "Shorten sentences and use simpler words; aim for a Flesch score above 50.", "low");

  if (targetKeyword) {
    const k = targetKeyword.toLowerCase();
    const inTitle = title.toLowerCase().includes(k);
    const inDesc = desc.toLowerCase().includes(k);
    const inH1 = h1s.some((h) => h.toLowerCase().includes(k));
    const inUrl = final.pathname.toLowerCase().includes(k.replace(/\s+/g, "-"));
    const occ = (text.toLowerCase().match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    const dens = words ? +((occ * k.split(" ").length / words) * 100).toFixed(2) : 0;
    const hits = [inTitle, inDesc, inH1, inUrl].filter(Boolean).length;
    add("content", "keyword", `Target keyword: “${targetKeyword}”`, hits >= 3 ? "pass" : hits >= 1 ? "warn" : "fail",
      `Title ${inTitle ? "✓" : "✗"} · Description ${inDesc ? "✓" : "✗"} · H1 ${inH1 ? "✓" : "✗"} · URL ${inUrl ? "✓" : "✗"} · ${occ}× (${dens}%)`,
      hits >= 3 ? "" : "Place the target keyword in the title, H1, meta description and URL slug, and use it naturally 0.5–2% in the body.", "high");
  }

  // ---------- TECHNICAL ----------
  const https = final.protocol === "https:";
  add("technical", "https", "HTTPS", https ? "pass" : "fail", https ? "Secure" : "Served over HTTP", https ? "" : "Install an SSL certificate (Let's Encrypt or Cloudflare) and redirect all HTTP traffic to HTTPS.", "high");
  if (httpVariant) {
    const redirects = httpVariant.url.startsWith("https:");
    add("technical", "http-redirect", "HTTP → HTTPS redirect", redirects ? "pass" : "warn", redirects ? "Redirects to HTTPS" : "HTTP version doesn't redirect", redirects ? "" : "Add a 301 redirect from http:// to https:// (Cloudflare: SSL/TLS → Edge Certificates → Always Use HTTPS).", "medium");
  }
  add("technical", "status", "HTTP status", page.status === 200 ? "pass" : "fail", String(page.status), page.status === 200 ? "" : "The page should return 200 OK.", "high");
  add("technical", "redirects", "Redirect chain", page.redirects.length <= 1 ? "pass" : "warn",
    page.redirects.length ? page.redirects.map((r) => `${r.status}`).join(" → ") + " → " + page.status : "No redirects",
    page.redirects.length <= 1 ? "" : `Collapse the ${page.redirects.length}-hop redirect chain into a single 301.`, "medium");
  add("technical", "robots", "robots.txt", robotsTxt ? "pass" : "warn", robotsTxt ? `Found (${robotsTxt.split("\n").length} lines)` : "Not found", robotsTxt ? "" : "Create /robots.txt with crawl rules and a Sitemap: line.", "medium");
  const blocksAll = robotsBlocks(robotsTxt, "*");
  if (blocksAll) add("technical", "robots-block", "robots.txt blocks site", "fail", "Disallow: / for all bots", "Remove `Disallow: /` unless the site is intentionally hidden.", "high");
  add("technical", "sitemap", "XML sitemap", sitemapOk ? "pass" : "warn", sitemapOk ? `${sitemapUrls} URLs` : "Not found", sitemapOk ? "" : "Generate /sitemap.xml, reference it in robots.txt and submit it in Google Search Console.", "medium");
  add("technical", "sitemap-ref", "Sitemap in robots.txt", sitemapRef ? "pass" : "warn", sitemapRef || "Not referenced", sitemapRef ? "" : `Add “Sitemap: ${origin}/sitemap.xml” to robots.txt.`, "low");
  add("technical", "viewport", "Mobile viewport", viewport.includes("width=device-width") ? "pass" : "fail", viewport || "Missing",
    viewport.includes("width=device-width") ? "" : 'Add <meta name="viewport" content="width=device-width, initial-scale=1">. Google indexes mobile-first.', "high");
  const urlClean = !/[A-Z_]|\?.*=.*&.*=/.test(final.pathname + final.search) && final.href.length < 100;
  add("technical", "url", "SEO-friendly URL", urlClean ? "pass" : "warn", final.pathname || "/", urlClean ? "" : "Use short, lowercase, hyphenated URLs without heavy query strings.", "low");

  // ---------- PERFORMANCE ----------
  const kb = Math.round(page.bytes / 1024);
  const scripts = $("script[src]").length;
  const blockingCss = $('head link[rel="stylesheet"]').length;
  const blockingJs = $("head script[src]:not([async]):not([defer]):not([type=module])").length;
  const enc = H["content-encoding"] || "";
  const cache = H["cache-control"] || "";
  add("performance", "ttfb", "Server response time (TTFB)", page.ttfb < 600 ? "pass" : page.ttfb < 1500 ? "warn" : "fail", `${page.ttfb} ms`,
    page.ttfb < 600 ? "" : "Reduce TTFB below 600 ms: enable page caching, a CDN (Cloudflare) and faster hosting.", "high");
  add("performance", "size", "HTML size", kb < 150 ? "pass" : kb < 500 ? "warn" : "fail", `${kb} KB`, kb < 150 ? "" : "Trim the HTML: remove inline SVG/JSON blobs and unused markup.", "medium");
  add("performance", "compression", "Compression (gzip/brotli)", enc ? "pass" : "warn", enc || "None detected", enc ? "" : "Enable Brotli or gzip on the server or CDN.", "medium");
  add("performance", "render-blocking", "Render-blocking resources", blockingJs === 0 && blockingCss <= 3 ? "pass" : "warn", `${blockingJs} sync scripts, ${blockingCss} stylesheets in <head>`,
    blockingJs === 0 && blockingCss <= 3 ? "" : "Add defer/async to head scripts and inline critical CSS to improve LCP.", "medium");
  add("performance", "scripts", "External scripts", scripts <= 15 ? "pass" : "warn", `${scripts} scripts`, scripts <= 15 ? "" : "Audit third-party scripts; each adds network and main-thread cost (hurts INP).", "low");
  add("performance", "cache", "Browser caching", /max-age=\d|s-maxage/.test(cache) ? "pass" : "warn", cache || "No Cache-Control", /max-age/.test(cache) ? "" : "Set Cache-Control headers (or a Cloudflare cache rule) for HTML and static assets.", "low");

  // ---------- LINKS & IMAGES ----------
  const imgs = $("img");
  const noAlt = imgs.filter((_, e) => !($(e).attr("alt") || "").trim() && $(e).attr("role") !== "presentation").length;
  const noDims = imgs.filter((_, e) => !$(e).attr("width") || !$(e).attr("height")).length;
  const lazy = imgs.filter((_, e) => $(e).attr("loading") === "lazy").length;
  const modern = imgs.filter((_, e) => /\.(webp|avif)(\?|$)/i.test($(e).attr("src") || "")).length + $("picture source[type*=webp],picture source[type*=avif]").length;
  if (imgs.length) {
    add("links", "alt", "Image alt text", noAlt === 0 ? "pass" : noAlt / imgs.length < 0.2 ? "warn" : "fail", `${imgs.length - noAlt}/${imgs.length} have alt`,
      noAlt ? `Write descriptive alt text for ${noAlt} image(s); it helps accessibility and image search.` : "", "medium");
    add("links", "dims", "Image dimensions set", noDims === 0 ? "pass" : "warn", `${noDims} without width/height`, noDims ? "Set width and height on images to prevent layout shift (CLS)." : "", "medium");
    add("links", "lazy", "Lazy loading", lazy > 0 || imgs.length < 4 ? "pass" : "warn", `${lazy}/${imgs.length} lazy`, lazy > 0 || imgs.length < 4 ? "" : 'Add loading="lazy" to below-the-fold images.', "low");
    add("links", "formats", "Modern image formats", modern > 0 ? "pass" : "warn", `${modern} WebP/AVIF`, modern ? "" : "Serve images as WebP or AVIF (25–50% smaller than JPEG/PNG).", "low");
  }
  const internal = new Set(), external = new Set();
  let nofollow = 0, emptyAnchors = 0;
  $("a[href]").each((_, e) => {
    const href = $(e).attr("href");
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return;
    let u; try { u = new URL(href, final); } catch { return; }
    u.hash = "";
    (u.host === final.host ? internal : external).add(u.href);
    if (/nofollow/i.test($(e).attr("rel") || "")) nofollow++;
    if (!$(e).text().trim() && !$(e).attr("aria-label") && !$(e).find("img[alt]").length) emptyAnchors++;
  });
  add("links", "internal", "Internal links", internal.size >= 5 ? "pass" : "warn", `${internal.size} unique`, internal.size >= 5 ? "" : "Add contextual internal links to related pages to spread link equity.", "medium");
  add("links", "external", "External links", "pass", `${external.size} unique, ${nofollow} nofollow`, "", "low");
  add("links", "anchors", "Descriptive anchor text", emptyAnchors === 0 ? "pass" : "warn", `${emptyAnchors} empty anchors`, emptyAnchors ? "Give every link visible text or an aria-label." : "", "low");
  const linkCheck = await checkLinks([...internal, ...external]);
  add("links", "broken", "Broken links", linkCheck.broken.length === 0 ? "pass" : "fail", `${linkCheck.broken.length} broken of ${linkCheck.checked} checked`,
    linkCheck.broken.length ? "Fix or remove: " + linkCheck.broken.slice(0, 5).map((b) => `${b.url} (${b.status || "error"})`).join(", ") : "", "high");

  // ---------- SOCIAL & SCHEMA ----------
  const og = (p) => $(`meta[property="og:${p}"]`).attr("content") || "";
  const tw = $('meta[name="twitter:card"]').attr("content") || "";
  const ogMissing = ["title", "description", "image", "url"].filter((p) => !og(p));
  add("social", "og", "Open Graph tags", ogMissing.length === 0 ? "pass" : ogMissing.length < 3 ? "warn" : "fail", ogMissing.length ? `Missing og:${ogMissing.join(", og:")}` : "Complete",
    ogMissing.length ? "Add Open Graph tags so links look right on LinkedIn, WhatsApp and Facebook." : "", "medium");
  add("social", "twitter", "Twitter/X card", tw ? "pass" : "warn", tw || "Missing", tw ? "" : 'Add <meta name="twitter:card" content="summary_large_image">.', "low");
  const schemaTypes = [];
  let schemaErrors = 0;
  $('script[type="application/ld+json"]').each((_, e) => {
    try {
      const j = JSON.parse($(e).contents().text());
      const walk = (n) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === "object") {
          if (n["@type"]) schemaTypes.push(...[].concat(n["@type"]));
          if (n["@graph"]) walk(n["@graph"]);
        }
      };
      walk(j);
    } catch { schemaErrors++; }
  });
  const microdata = $("[itemtype]").length;
  add("social", "schema", "Structured data (JSON-LD)", schemaTypes.length ? (schemaErrors ? "warn" : "pass") : microdata ? "warn" : "fail",
    schemaTypes.length ? [...new Set(schemaTypes)].join(", ") + (schemaErrors ? ` · ${schemaErrors} invalid block(s)` : "") : microdata ? "Microdata only" : "None",
    schemaTypes.length && !schemaErrors ? "" : "Add JSON-LD schema (Organization, WebSite, Article/Product/FAQPage as relevant) to qualify for rich results.", "medium");

  // ---------- AI SEARCH (GEO) ----------
  const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"];
  const blockedBots = aiBots.filter((b) => robotsBlocks(robotsTxt, b));
  add("geo", "ai-crawlers", "AI crawler access", blockedBots.length ? "warn" : "pass", blockedBots.length ? `Blocked: ${blockedBots.join(", ")}` : "No AI crawlers blocked",
    blockedBots.length ? "These bots can't read your site, so ChatGPT/Perplexity/AI Overviews can't cite it. Unblock them if you want AI visibility." : "", "medium");
  const llmsOk = llms && llms.status === 200 && !/<html/i.test(llms.body);
  add("geo", "llms", "llms.txt file", llmsOk ? "pass" : "warn", llmsOk ? "Found" : "Not found", llmsOk ? "" : "Add /llms.txt: a Markdown summary of your site and key URLs for LLMs.", "low");
  const questionHeads = headings.filter((h) => /\?$|^(how|what|why|when|which|who|can|is|does|should)\b/i.test(h.text)).length;
  add("geo", "questions", "Question-style headings", questionHeads >= 2 ? "pass" : "warn", `${questionHeads} found`, questionHeads >= 2 ? "" : "Phrase some H2/H3s as real user questions and answer each in the first 40–60 words; AI engines quote these passages.", "medium");
  const hasFaq = schemaTypes.some((t) => /FAQPage|QAPage|HowTo/i.test(t));
  const lists = $("main ul, main ol, article ul, article ol, table").length || $("ul,ol,table").length;
  add("geo", "extractable", "Extractable formatting", lists >= 2 || hasFaq ? "pass" : "warn", `${lists} lists/tables${hasFaq ? ", FAQ schema" : ""}`, lists >= 2 || hasFaq ? "" : "Add lists, tables and an FAQ section; structured passages are cited more often by AI search.", "low");
  const author = $('meta[name="author"]').attr("content") || $('[rel="author"], .author, [itemprop="author"]').first().text().trim() || schemaTypes.includes("Person");
  const dates = $("time[datetime]").length || $('meta[property="article:modified_time"], meta[property="article:published_time"]').length || /dateModified|datePublished/.test(page.body);
  add("geo", "eeat", "Author & freshness signals (E-E-A-T)", author && dates ? "pass" : "warn", `Author ${author ? "✓" : "✗"} · Dates ${dates ? "✓" : "✗"}`,
    author && dates ? "" : "Show a named author with credentials and a visible published/updated date to build trust.", "medium");

  // ---------- SCORING ----------
  const weights = { high: 3, medium: 2, low: 1 };
  const pts = { pass: 1, warn: 0.5, fail: 0 };
  const categories = Object.entries(CATEGORIES).map(([key, c]) => {
    const list = checks.filter((x) => x.category === key);
    const max = list.reduce((s, x) => s + weights[x.impact], 0) || 1;
    const got = list.reduce((s, x) => s + weights[x.impact] * pts[x.status], 0);
    return { key, label: c.label, weight: c.weight, score: Math.round((got / max) * 100), passed: list.filter((x) => x.status === "pass").length, total: list.length };
  });
  const score = Math.round(categories.reduce((s, c) => s + c.score * c.weight, 0) / categories.reduce((s, c) => s + c.weight, 0));
  const summary = {
    passed: checks.filter((c) => c.status === "pass").length,
    warnings: checks.filter((c) => c.status === "warn").length,
    failed: checks.filter((c) => c.status === "fail").length,
  };

  return {
    url: final.href,
    requestedUrl: input.href,
    fetchedAt: new Date().toISOString(),
    score,
    grade: score >= 90 ? "A" : score >= 80 ? "B" : score >= 65 ? "C" : score >= 50 ? "D" : "F",
    summary,
    categories,
    checks,
    page: {
      title, description: desc, h1: h1s[0] || "", words, lang, status: page.status, ttfb: page.ttfb, loadMs: page.totalMs, sizeKb: kb,
      headings: headings.slice(0, 40), keywords, schemaTypes: [...new Set(schemaTypes)], internalLinks: internal.size, externalLinks: external.size,
      images: imgs.length, server: H.server || "", excerpt: text.slice(0, 2500),
    },
    targetKeyword,
  };
}
