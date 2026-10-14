import { SITE, og } from "@/lib/site";

export const metadata = { title: "Privacy Policy", description: `How ${SITE.name} handles data.`, alternates: { canonical: "/privacy" },
  get openGraph() { return og("/privacy", this.title, this.description); } };

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="display text-6xl">Privacy Policy</h1>
      <div className="prose-article mt-10">
        <p>Last updated: October 7, 2026.</p>
        <h2>What we collect</h2>
        <p>When you run an audit we process the URL you submit and the public content of that page. We do not require an account and we do not store audit results in a database.</p>
        <h2>AI processing</h2>
        <p>To generate recommendations, a summary of the audited page (title, headings, a text excerpt and the issues found) is sent to our AI provider, OpenAI, under its API data-usage terms.</p>
        <h2>Logs</h2>
        <p>Our servers keep short-lived technical logs, including IP addresses, for rate limiting and abuse prevention.</p>
        <h2>Contact</h2>
        <p>Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with any privacy question.</p>
      </div>
    </div>
  );
}
