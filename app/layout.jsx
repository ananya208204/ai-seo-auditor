import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: Free AI SEO Website Auditor`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  keywords: ["AI SEO audit", "SEO website auditor", "free SEO audit tool", "technical SEO checker", "GEO audit", "website SEO checker"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, images: ["/opengraph-image"], title: `${SITE.name}: Free AI SEO Website Auditor`, description: SITE.description, locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${SITE.name}: Free AI SEO Website Auditor`, description: SITE.description },
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#12120f" },
  ],
};

const orgSchema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE.url}/#org`, name: SITE.name, url: SITE.url, logo: `${SITE.url}/icon.svg`, email: SITE.email },
    { "@type": "WebSite", "@id": `${SITE.url}/#website`, name: SITE.name, url: SITE.url, publisher: { "@id": `${SITE.url}/#org` } },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
