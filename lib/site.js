export const SITE = {
  name: "Crawlwise AI",
  tagline: "AI SEO Website Auditor",
  description:
    "Free AI SEO website auditor. Scan any URL for 40+ technical, on-page, content and AI-search (GEO) issues and get prioritized, AI-written fixes in seconds.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  email: "hello@crawlwise.ai",
  author: "Yasir Khan",
};

/** Per-page Open Graph block (Next.js replaces, not merges, openGraph in child routes). */
export const og = (path, title, description) => ({
  type: "website",
  siteName: SITE.name,
  url: path,
  title,
  description,
  images: ["/opengraph-image"],
});
