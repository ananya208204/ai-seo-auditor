const PRIORITY = { high: 0, medium: 1, low: 2 };

/** Drop generic segments ("Home", "Call Us Today!!") and keep whole segments within 60 chars. */
function shortenTitle(t) {
  const parts = t.split(/\s+[|\-–—:]\s+/).map((s) => s.replace(/!+$/, "").trim())
    .filter((s) => s && !/^(home|welcome|homepage|call us.*|best .*s)$/i.test(s));
  let out = "";
  for (const s of parts) {
    const next = out ? `${out} | ${s}` : s;
    if (next.length > 60) break;
    out = next;
  }
  return out || t.slice(0, 57).trimEnd() + "…";
}

/** Rule-based insights used when no OpenAI key is set or the API call fails. */
export function fallbackInsights(audit) {
  const issues = audit.checks
    .filter((c) => c.status !== "pass")
    .sort((a, b) => (a.status === "fail" ? -1 : 1) - (b.status === "fail" ? -1 : 1) || PRIORITY[a.impact] - PRIORITY[b.impact]);
  const p = audit.page;
  return {
    source: "rules",
    summary: `This page scores ${audit.score}/100 (grade ${audit.grade}) with ${audit.summary.failed} critical issue(s) and ${audit.summary.warnings} warning(s). ${
      issues[0] ? `Start with “${issues[0].title}”, which has the biggest ranking impact.` : "The fundamentals are in place; focus on content depth and earning links."
    }`,
    priorities: issues.slice(0, 6).map((c) => ({ title: c.title, why: c.value, action: c.fix, impact: c.impact, effort: c.impact === "high" ? "Low" : "Medium" })),
    rewrites: {
      title: shortenTitle(p.title || p.h1 || ""),
      description: p.description || (p.excerpt ? p.excerpt.slice(0, 155).trimEnd() + "…" : ""),
      h1: p.h1 || p.title || "",
    },
    keywords: p.keywords.slice(0, 8).map((k) => ({ keyword: k.term, intent: "Unknown", note: `Appears ${k.count}× (${k.density}%)` })),
    contentGaps: [
      p.words < 600 ? "Expand the main content with original examples, data and step-by-step guidance." : null,
      "Add an FAQ section that answers the questions your audience searches for.",
      "Link to 3–5 related pages on your own site from within the body copy.",
    ].filter(Boolean),
    schema: null,
    geo: ["Answer the main question in the first 50 words of the page.", "Use question-style H2s and short, quotable answers.", "Publish an /llms.txt that lists your most important pages."],
  };
}

const SYSTEM = `You are a senior technical SEO consultant and GEO (generative engine optimization) specialist.
You receive a machine-generated audit of ONE web page. Write specific, practical recommendations grounded ONLY in the data provided.
Never invent metrics (search volume, backlinks, traffic). Respond with valid JSON only.`;

function buildPrompt(audit) {
  const p = audit.page;
  const issues = audit.checks.filter((c) => c.status !== "pass").map((c) => `- [${c.status.toUpperCase()}/${c.impact}] ${c.title}: ${c.value}`);
  return `URL: ${audit.url}
Score: ${audit.score}/100 (${audit.grade})
Target keyword: ${audit.targetKeyword || "(not provided — infer the most likely one)"}
Title: ${p.title}
Meta description: ${p.description}
H1: ${p.h1}
Words: ${p.words}
Headings: ${p.headings.map((h) => `H${h.level} ${h.text}`).slice(0, 25).join(" | ")}
Top terms: ${p.keywords.map((k) => `${k.term}(${k.count})`).join(", ")}
Existing schema: ${p.schemaTypes.join(", ") || "none"}
Issues:
${issues.join("\n") || "none"}
Page text excerpt:
"""${p.excerpt.slice(0, 2000)}"""

Return JSON with exactly this shape:
{
 "summary": "3-4 sentence executive summary for a site owner",
 "priorities": [{"title": "", "why": "", "action": "concrete step, include code/text where useful", "impact": "high|medium|low", "effort": "Low|Medium|High"}],  // 5-7 items, highest ROI first
 "rewrites": {"title": "50-60 chars", "description": "140-160 chars", "h1": ""},
 "keywords": [{"keyword": "", "intent": "Informational|Commercial|Transactional|Navigational", "note": "where/how to use it"}], // 6-10 incl. LSI/long-tail
 "contentGaps": ["subtopics or questions the page should cover"], // 4-6
 "schema": "a complete JSON-LD <script> block suited to this page, as a string",
 "geo": ["specific actions to get cited by ChatGPT, Perplexity and Google AI Overviews"] // 3-5
}`;
}

export async function aiInsights(audit) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return fallbackInsights(audit);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: buildPrompt(audit) },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    const base = fallbackInsights(audit);
    return {
      source: "openai",
      summary: parsed.summary || base.summary,
      priorities: Array.isArray(parsed.priorities) && parsed.priorities.length ? parsed.priorities : base.priorities,
      rewrites: { ...base.rewrites, ...(parsed.rewrites || {}) },
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : base.keywords,
      contentGaps: Array.isArray(parsed.contentGaps) ? parsed.contentGaps : base.contentGaps,
      schema: typeof parsed.schema === "string" ? parsed.schema : parsed.schema ? JSON.stringify(parsed.schema, null, 2) : null,
      geo: Array.isArray(parsed.geo) ? parsed.geo : base.geo,
    };
  } catch (e) {
    console.error("[ai] falling back to rules:", e.message);
    return { ...fallbackInsights(audit), aiError: "AI recommendations were unavailable, so rule-based fixes are shown." };
  } finally {
    clearTimeout(timer);
  }
}
