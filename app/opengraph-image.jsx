import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}: Free AI SEO Website Auditor`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f3f0e8", padding: 72, fontFamily: "serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, color: "#15140f" }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: "#15140f", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: 999, border: "4px solid #c8f031" }} />
          </div>
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 88, lineHeight: 1, color: "#15140f", letterSpacing: -2 }}>
          <span>Find what's holding</span>
          <span>your site back.</span>
          <span style={{ background: "#c8f031", alignSelf: "flex-start", padding: "0 12px", marginTop: 8 }}>Fix it with AI.</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#4a473d" }}>Free SEO audit · 40+ checks · AI-written fixes</div>
      </div>
    ),
    size
  );
}
