import { runAudit } from "@/lib/audit";
import { aiInsights } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Simple per-IP rate limit (in-memory; swap for Redis in multi-instance deploys)
const hits = new Map();
const LIMIT = 10, WINDOW = 60 * 60 * 1000;
function limited(ip) {
  if (process.env.NODE_ENV !== "production") return false;
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

export async function POST(req) {
  const ip = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (limited(ip)) return Response.json({ error: "Rate limit reached: 10 audits per hour. Please try again later." }, { status: 429 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }
  const url = String(body.url || "").slice(0, 2048);
  const keyword = String(body.keyword || "").trim().slice(0, 80);

  try {
    const audit = await runAudit(url, keyword);
    const insights = await aiInsights(audit);
    const { excerpt, ...page } = audit.page;
    return Response.json({ ...audit, page, insights });
  } catch (e) {
    return Response.json({ error: e.message || "Audit failed." }, { status: 422 });
  }
}
