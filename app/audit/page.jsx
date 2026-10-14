import { Suspense } from "react";
import Report from "@/components/Report";

export const metadata = {
  title: "SEO Audit Report",
  description: "Your AI-powered SEO audit report with scores, issues and prioritised fixes.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-24 text-ink-3">Loading…</div>}>
      <Report />
    </Suspense>
  );
}
