import dns from "node:dns/promises";
import net from "node:net";

const UA =
  "Mozilla/5.0 (compatible; CrawlwiseBot/1.0; +https://crawlwise.ai/bot) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const MAX_BYTES = 5 * 1024 * 1024;

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 || a === 127 || a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }
  const l = ip.toLowerCase();
  if (l.startsWith("::ffff:")) return isPrivateIp(l.slice(7));
  return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80");
}

export function normalizeUrl(input) {
  let s = String(input || "").trim();
  if (!s) throw new Error("Please enter a URL.");
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  let u;
  try { u = new URL(s); } catch { throw new Error("That doesn't look like a valid URL."); }
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only http and https URLs are supported.");
  if (!ALLOW_PRIVATE && !u.hostname.includes(".")) throw new Error("Please enter a public domain name.");
  u.hash = "";
  return u;
}

// Dev only: set AUDIT_ALLOW_PRIVATE=1 to audit localhost pages. Never enable in production.
const ALLOW_PRIVATE = process.env.AUDIT_ALLOW_PRIVATE === "1" && process.env.NODE_ENV !== "production";

async function assertPublicHost(hostname) {
  if (ALLOW_PRIVATE) return;
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Private or local addresses can't be audited.");
    return;
  }
  let addrs;
  try { addrs = await dns.lookup(hostname, { all: true }); }
  catch { throw new Error(`Could not resolve ${hostname}. Check the domain name.`); }
  if (addrs.some((a) => isPrivateIp(a.address))) throw new Error("Private or local addresses can't be audited.");
}

/** Fetch with manual redirect following, SSRF checks on every hop, timing and size cap. */
export async function safeFetch(url, { method = "GET", timeout = 15000, maxRedirects = 5, readBody = true } = {}) {
  const chain = [];
  let current = typeof url === "string" ? new URL(url) : url;
  const start = performance.now();
  for (let i = 0; i <= maxRedirects; i++) {
    await assertPublicHost(current.hostname);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    let res;
    const hopStart = performance.now();
    try {
      res = await fetch(current, {
        method,
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Encoding": "gzip, deflate, br" },
      });
    } catch (e) {
      clearTimeout(timer);
      throw new Error(e.name === "AbortError" ? `Timed out fetching ${current.href}` : `Could not connect to ${current.host}.`);
    }
    const ttfb = Math.round(performance.now() - hopStart);
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      clearTimeout(timer);
      chain.push({ url: current.href, status: res.status });
      current = new URL(res.headers.get("location"), current);
      continue;
    }
    let body = "";
    let bytes = 0;
    if (readBody && method !== "HEAD" && res.body) {
      const reader = res.body.getReader();
      const chunks = [];
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.length;
          if (bytes > MAX_BYTES) { await reader.cancel(); break; }
          chunks.push(value);
        }
      } catch { /* partial body is fine */ }
      body = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
    }
    clearTimeout(timer);
    return {
      url: current.href,
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      body,
      bytes,
      ttfb,
      totalMs: Math.round(performance.now() - start),
      redirects: chain,
    };
  }
  throw new Error("Too many redirects.");
}

export async function tryFetch(url, opts) {
  try { return await safeFetch(url, { timeout: 8000, ...opts }); } catch { return null; }
}
