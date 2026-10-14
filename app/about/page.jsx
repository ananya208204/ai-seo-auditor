import { SITE, og } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `Why we built ${SITE.name}, an AI SEO auditor that turns audit data into fixes site owners can actually ship.`,
  alternates: { canonical: "/about" },
  get openGraph() { return og("/about", this.title, this.description); },
};

export default function About() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author,
    jobTitle: "Full Stack Developer",
    url: `${SITE.url}/about`,
    worksFor: { "@type": "Organization", name: SITE.name },
    knowsAbout: ["Technical SEO", "Next.js", "Web performance", "Generative Engine Optimization"],
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <p className="eyebrow">About</p>
      <h1 className="display mt-3 text-6xl">SEO audits should end in fixes, not spreadsheets.</h1>
      <div className="prose-article mt-10">
        <p>Most SEO tools are built for specialists. They return hundreds of rows of warnings and leave small-business owners, students and developers to work out what matters. {SITE.name} takes a different approach: run the checks a technical SEO would run, then use AI to explain the findings in plain language and write the fixes.</p>
        <h2>What makes it different</h2>
        <ul>
          <li><strong>Prioritised, not exhaustive.</strong> Every issue is weighted by ranking impact so you know what to fix first.</li>
          <li><strong>Written for your page.</strong> Title, meta description and schema suggestions are generated from your actual content.</li>
          <li><strong>Ready for AI search.</strong> A dedicated GEO category checks whether ChatGPT, Perplexity and Google AI Overviews can find and cite you.</li>
        </ul>
        <h2>Who builds it</h2>
        <p>{SITE.name} is built by {SITE.author}, a full stack developer working with Next.js, Node.js and MongoDB, who has shipped and optimised production websites for clients across e-commerce, health-tech and market research.</p>
        <h2>Contact</h2>
        <p>Questions, feedback or partnership ideas: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </div>
  );
}
