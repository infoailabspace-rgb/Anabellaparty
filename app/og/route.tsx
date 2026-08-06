import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// Zīmola tagline fallback (kad nav per-lapas virsraksta). Bez ārējiem fontiem/attēliem.
const TAGLINE: Record<string, string> = {
  lv: "Pasākumu inventāra noma Latvijā",
  en: "Event equipment rental in Latvia",
  ru: "Аренда праздничного инвентаря в Латвии",
};

function truncate(s: string, n = 60): string {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "lv";
  const titleParam = searchParams.get("title");
  const tagline = TAGLINE[locale] ?? TAGLINE.lv;
  const heading = truncate(titleParam || tagline);
  const sub = titleParam ? tagline : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg,#0F1419 0%,#1A3A4A 100%)",
          padding: "80px",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 700,
            color: "#D4A960",
            letterSpacing: "0.08em",
          }}
        >
          ANABELLA PARTY
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 90,
              height: 6,
              background: "#D4A960",
              marginBottom: 32,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              color: "#F5F5F0",
              lineHeight: 1.1,
            }}
          >
            {heading}
          </div>
          {sub ? (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                color: "#F5F5F0",
                opacity: 0.7,
                marginTop: 24,
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#D4A960" }}>
          anabellaparty.lv
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
