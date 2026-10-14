"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuditForm({ compact = false, initialUrl = "", initialKeyword = "" }) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [kw, setKw] = useState(initialKeyword);
  const [showKw, setShowKw] = useState(!!initialKeyword);

  function submit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    const q = new URLSearchParams({ url: url.trim() });
    if (kw.trim()) q.set("kw", kw.trim());
    router.push(`/audit?${q}`);
  }

  return (
    <form onSubmit={submit} className="w-full" role="search" aria-label="Audit a website">
      <div className={`flex flex-col gap-2 rounded-2xl border border-ink bg-card p-2 shadow-[6px_6px_0_var(--ink)] sm:flex-row ${compact ? "" : "sm:p-2.5"}`}>
        <label htmlFor="audit-url" className="sr-only">Website URL</label>
        <input
          id="audit-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="yourwebsite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-base outline-none placeholder:text-ink-3"
          required
        />
        <button type="submit" className="rounded-xl bg-accent px-6 py-3 font-semibold text-accent-ink transition hover:brightness-95 active:translate-y-px">
          Audit my site →
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-3">
        {showKw ? (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <label htmlFor="audit-kw" className="whitespace-nowrap">Target keyword</label>
            <input
              id="audit-kw"
              type="text"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="e.g. seo audit tool"
              className="min-w-0 flex-1 rounded-lg border border-line bg-card px-3 py-1.5 text-ink outline-none focus:border-ink sm:w-64"
            />
          </div>
        ) : (
          <button type="button" onClick={() => setShowKw(true)} className="underline decoration-dotted underline-offset-4 hover:text-ink">
            + Add a target keyword (optional)
          </button>
        )}
        {!compact && <span>Free · No sign-up · ~30 seconds</span>}
      </div>
    </form>
  );
}
