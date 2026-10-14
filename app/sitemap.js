import { SITE } from "@/lib/site";
import { POSTS } from "@/lib/posts";

export default function sitemap() {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...POSTS.map((p) => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: new Date(p.updated), changeFrequency: "monthly", priority: 0.7 })),
  ];
}
