import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <p className="font-mono text-sm text-ink-3">404</p>
      <h1 className="display mt-3 text-6xl">This page isn’t indexed. Anywhere.</h1>
      <p className="mt-4 text-ink-2">The link may be broken, which is exactly the kind of thing we catch.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-paper">Back to home</Link>
    </div>
  );
}
