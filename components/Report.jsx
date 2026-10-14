"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuditForm from "./AuditForm";

const STEPS = ["Resolving domain", "Fetching page", "Reading robots.txt & sitemap", "Checking links", "Scoring 7 categories", "Writing AI recommendations"];
const tone = (s) => (s >= 80 ? "var(--pass)" : s >= 60 ? "var(--warn)" : "var(--fail)");
const STATUS = {
  pass: { label: "Pass", color: "var(--pass)", icon: "✓" },
  warn: { label: "Warning", color: "var(--warn)", icon: "!" },
  fail: { label: "Fail", color: "var(--fail)", icon: "✕" },
};

export default function Report() {
  const params = useSearchParams();
  const url = params.get("url") || "";
  const kw = params.get("kw") || "";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setData(null); setError(""); setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2200);
    fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, keyword: kw }) })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || "Audit failed"); return j; })
      .then((j) => !cancelled && setData(j))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => clearInterval(t));
    return () => { cancelled = true; clearInterval(t); };
  }, [url, kw]);

  if (!url) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <h1 className="display text-5xl">Run an SEO audit</h1>
        <div className="mt-8"><AuditForm /></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <p className="eyebrow text-fail">Audit failed</p>
        <h1 className="display mt-3 text-4xl">We couldn’t audit that page.</h1>
        <p className="mt-4 rounded-lg border border-fail/40 bg-card p-4 font-mono text-sm">{error}</p>
        <div className="mt-8"><AuditForm initialUrl={url} initialKeyword={kw} compact /></div>
      </div>
    );
  }
  if (!data) return <Loading url={url} step={step} />;
  return <Results data={data} />;
}

function Loading({ url, step }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24" aria-live="polite">
      <p className="eyebrow">Auditing</p>
      <h1 className="mt-2 break-all font-mono text-lg">{url}</h1>
      <div className="relative mt-8 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="scanline absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
        <ul className="relative space-y-1.5 p-5 font-mono text-sm">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? "text-ink-3" : i === step ? "text-ink" : "text-ink-3/40"}>
              {i < step ? "✓" : i === step ? "›" : "·"} {s}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-sm text-ink-3">This usually takes 15–40 seconds.</p>
    </div>
  );
}

function ScoreRing({ score, size = 168 }) {
  const r = size / 2 - 10, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`SEO score ${score} out of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-2)" strokeWidth="12" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone(score)} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill="var(--ink)" style={{ font: `400 ${size * 0.36}px var(--font-display)` }}>{score}</text>
    </svg>
  );
}

function Copy({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="no-print shrink-0 rounded-md border border-line px-2 py-1 font-mono text-xs hover:border-ink"
      onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

function Results({ data }) {
  const [filter, setFilter] = useState("issues");
  const [cat, setCat] = useState("all");
  const ins = data.insights || {};
  const checks = useMemo(() => {
    const order = { fail: 0, warn: 1, pass: 2 }, imp = { high: 0, medium: 1, low: 2 };
    return data.checks
      .filter((c) => (filter === "issues" ? c.status !== "pass" : filter === "all" ? true : c.status === filter))
      .filter((c) => cat === "all" || c.category === cat)
      .sort((a, b) => order[a.status] - order[b.status] || imp[a.impact] - imp[b.impact]);
  }, [data, filter, cat]);

  function downloadJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seo-audit-${new URL(data.url).hostname}.json`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* HEADER */}
      <div className="no-print mb-8"><AuditForm compact initialUrl={data.requestedUrl} initialKeyword={data.targetKeyword} /></div>
      <section className="grid gap-8 rounded-3xl border border-ink bg-card p-6 sm:p-8 lg:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-6">
          <ScoreRing score={data.score} />
          <div className="lg:hidden"><Meta data={data} /></div>
        </div>
        <div>
          <div className="hidden lg:block"><Meta data={data} /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.categories.map((c) => (
              <button key={c.key} type="button" onClick={() => { setCat(cat === c.key ? "all" : c.key); setFilter("all"); }}
                className={`rounded-xl border p-3 text-left transition ${cat === c.key ? "border-ink bg-paper-2" : "border-line hover:border-ink-3"}`}>
                <div className="flex items-baseline justify-between"><span className="text-sm">{c.label}</span><span className="font-mono text-sm">{c.score}</span></div>
                <div className="mt-2 h-1.5 rounded-full bg-paper-2"><div className="h-full rounded-full" style={{ width: `${c.score}%`, background: tone(c.score) }} /></div>
                <p className="mt-1.5 font-mono text-[11px] text-ink-3">{c.passed}/{c.total} passed</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI SUMMARY */}
      <section className="mt-8 rounded-3xl bg-ink p-6 text-paper sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{ins.source === "openai" ? "AI analysis" : "Analysis"}</p>
          <div className="no-print flex gap-2">
            <button type="button" onClick={() => window.print()} className="rounded-full border border-paper/30 px-3 py-1 text-xs hover:bg-paper/10">Save as PDF</button>
            <button type="button" onClick={downloadJson} className="rounded-full border border-paper/30 px-3 py-1 text-xs hover:bg-paper/10">Download JSON</button>
          </div>
        </div>
        <p className="mt-4 max-w-4xl text-lg leading-relaxed">{ins.summary}</p>
        {ins.aiError && <p className="mt-3 text-sm text-paper/60">{ins.aiError}</p>}
      </section>

      {/* PRIORITIES */}
      {ins.priorities?.length > 0 && (
        <section className="mt-12">
          <h2 className="display text-4xl">Fix these first</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {ins.priorities.map((p, i) => (
              <li key={i} className="rounded-2xl border border-line bg-card p-5">
                <div className="flex items-start gap-4">
                  <span className="display text-4xl text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{p.title}</h3>
                    <div className="mt-1 flex gap-2 font-mono text-[11px] uppercase">
                      <span style={{ color: p.impact === "high" ? "var(--fail)" : p.impact === "medium" ? "var(--warn)" : "var(--ink-3)" }}>{p.impact} impact</span>
                      {p.effort && <span className="text-ink-3">· {p.effort} effort</span>}
                    </div>
                    {p.why && <p className="mt-2 text-sm text-ink-2">{p.why}</p>}
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm">{p.action}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* REWRITES */}
      {ins.rewrites && (
        <section className="mt-12">
          <h2 className="display text-4xl">Suggested rewrites</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {[["Title tag", data.page.title, ins.rewrites.title], ["Meta description", data.page.description, ins.rewrites.description], ["H1", data.page.h1, ins.rewrites.h1]].map(([label, before, after]) => (
              <div key={label} className="rounded-2xl border border-line bg-card p-5">
                <p className="eyebrow">{label}</p>
                <p className="mt-3 text-sm text-ink-3"><span className="font-mono text-[11px] uppercase">Now · {before?.length || 0}</span><br />{before || "—"}</p>
                <div className="mt-3 rounded-lg border border-ink p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase text-pass">Suggested · {after?.length || 0}</span>
                    {after && <Copy text={after} />}
                  </div>
                  <p className="mt-1 text-sm">{after || "—"}</p>
                </div>
              </div>
            ))}
          </div>
          <GooglePreview url={data.url} title={ins.rewrites.title || data.page.title} desc={ins.rewrites.description || data.page.description} />
        </section>
      )}

      {/* ALL CHECKS */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-4xl">All checks</h2>
          <div className="no-print flex flex-wrap gap-2 text-sm" role="tablist">
            {[["issues", `Issues (${data.summary.failed + data.summary.warnings})`], ["fail", `Failed (${data.summary.failed})`], ["warn", `Warnings (${data.summary.warnings})`], ["pass", `Passed (${data.summary.passed})`], ["all", "All"]].map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)}
                className={`rounded-full border px-3 py-1 ${filter === k ? "border-ink bg-ink text-paper" : "border-line"}`}>{l}</button>
            ))}
          </div>
        </div>
        {cat !== "all" && (
          <p className="mt-3 text-sm text-ink-3">Showing {data.categories.find((c) => c.key === cat)?.label} · <button className="underline" onClick={() => setCat("all")}>show all categories</button></p>
        )}
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-card">
          {checks.length === 0 && <li className="p-6 text-ink-3">Nothing here. Nice work.</li>}
          {checks.map((c) => {
            const s = STATUS[c.status];
            return (
              <li key={c.category + c.id} className="grid gap-2 p-5 sm:grid-cols-[auto_1fr_auto] sm:gap-4">
                <span className="grid h-7 w-7 place-items-center rounded-full font-mono text-sm font-semibold text-paper" style={{ background: s.color }} aria-label={s.label}>{s.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-medium">{c.title}</h3>
                  <p className="mt-0.5 break-words font-mono text-xs text-ink-3">{c.value}</p>
                  {c.fix && <p className="mt-2 break-words text-sm text-ink-2">{c.fix}</p>}
                </div>
                <span className="self-start font-mono text-[11px] uppercase text-ink-3">{c.impact}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* KEYWORDS + GAPS */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="display text-3xl">Keyword opportunities</h2>
          <ul className="mt-4 divide-y divide-line">
            {!ins.keywords?.length && <li className="py-3 text-sm text-ink-3">Not enough text on the page to suggest keywords. Add more content and re-run.</li>}
            {(ins.keywords || []).map((k, i) => (
              <li key={i} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0"><p className="font-medium">{k.keyword}</p><p className="text-sm text-ink-3">{k.note}</p></div>
                <span className="shrink-0 rounded-full bg-paper-2 px-2 py-0.5 font-mono text-[11px]">{k.intent}</span>
              </li>
            ))}
          </ul>
          {data.page.keywords?.length > 0 && (
            <>
              <p className="eyebrow mt-6">Most used terms on page</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.page.keywords.map((k) => (<span key={k.term} className="rounded-md border border-line px-2 py-1 font-mono text-xs">{k.term} <span className="text-ink-3">{k.density}%</span></span>))}
              </div>
            </>
          )}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="display text-3xl">Content gaps</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-2">{(ins.contentGaps || []).map((g, i) => <li key={i}>{g}</li>)}</ul>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="display text-3xl">AI search (GEO) moves</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-2">{(ins.geo || []).map((g, i) => <li key={i}>{g}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* SCHEMA */}
      {ins.schema && (
        <section className="mt-12 rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="display text-3xl">Suggested schema markup</h2>
            <Copy text={ins.schema} />
          </div>
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-ink p-4 font-mono text-xs text-paper"><code>{ins.schema}</code></pre>
        </section>
      )}

      {/* PAGE FACTS */}
      <section className="mt-12">
        <h2 className="display text-3xl">Page snapshot</h2>
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {[["Status", data.page.status], ["Response", `${data.page.ttfb} ms`], ["HTML size", `${data.page.sizeKb} KB`], ["Words", data.page.words],
            ["Internal links", data.page.internalLinks], ["External links", data.page.externalLinks], ["Images", data.page.images], ["Server", data.page.server || "—"]].map(([k, v]) => (
            <div key={k} className="bg-card p-4"><dt className="eyebrow">{k}</dt><dd className="mt-1 truncate font-mono">{v}</dd></div>
          ))}
        </dl>
        {data.page.headings?.length > 0 && (
          <details className="mt-4 rounded-2xl border border-line bg-card p-5">
            <summary className="cursor-pointer font-medium">Heading outline ({data.page.headings.length})</summary>
            <ul className="mt-3 space-y-1 font-mono text-xs">
              {data.page.headings.map((h, i) => (<li key={i} style={{ paddingLeft: (h.level - 1) * 16 }}><span className="text-ink-3">H{h.level}</span> {h.text}</li>))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}

function Meta({ data }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow">SEO score · Grade {data.grade}</p>
      <h1 className="mt-1 break-all font-mono text-lg">{data.url}</h1>
      <p className="mt-2 text-sm text-ink-3">
        <span style={{ color: "var(--fail)" }}>{data.summary.failed} failed</span> · <span style={{ color: "var(--warn)" }}>{data.summary.warnings} warnings</span> · <span style={{ color: "var(--pass)" }}>{data.summary.passed} passed</span>
        {" · "}{new Date(data.fetchedAt).toLocaleString()}
      </p>
    </div>
  );
}

function GooglePreview({ url, title, desc }) {
  const u = new URL(url);
  return (
    <div className="mt-6 max-w-2xl rounded-2xl border border-line bg-white p-5 text-[#202124]">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[#70757a]">Search result preview</p>
      <p className="truncate text-sm text-[#4d5156]">{u.hostname}{u.pathname !== "/" ? ` › ${u.pathname.split("/").filter(Boolean).join(" › ")}` : ""}</p>
      <p className="mt-1 truncate text-xl text-[#1a0dab]">{title}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{desc}</p>
    </div>
  );
}
