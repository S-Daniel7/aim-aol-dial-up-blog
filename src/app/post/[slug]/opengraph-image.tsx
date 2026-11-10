import { ImageResponse } from "next/og";
import { fetchPostBySlug } from "@/lib/posts";

export const alt = "AIM chat log";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

const MAX_LINES = 5;
const MAX_CHARS = 90;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await fetchPostBySlug(slug);
  const title = data?.post.title ?? "chat log";
  const owner = data?.post.my_handle ?? process.env.NEXT_PUBLIC_SCREEN_NAME ?? "soapie";
  const lines = (data?.messages ?? [])
    .filter((m) => m.kind === "text" && m.body)
    .slice(0, MAX_LINES)
    .map((m) => ({
      sender: m.sender,
      body: (m.body ?? "").length > MAX_CHARS ? `${(m.body ?? "").slice(0, MAX_CHARS)}…` : (m.body ?? ""),
    }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 60,
          background: "#1a1a2e",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#f4f0ff",
            border: "6px solid #000",
            boxShadow: "12px 12px 0 #cc0000",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 24px",
              background: "#cc0000",
              color: "#fff",
              fontSize: 34,
              borderBottom: "6px solid #000",
            }}
          >
            <span style={{ display: "flex" }}>{title.length > 48 ? `${title.slice(0, 48)}…` : title}</span>
            <span style={{ display: "flex" }}>_ □ ×</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: 28, gap: 14, minHeight: 300 }}>
            {lines.length === 0 ? (
              <div style={{ display: "flex", fontSize: 30, color: "#555" }}>soapie — saved aim chat</div>
            ) : (
              lines.map((l, i) => (
                <div key={i} style={{ display: "flex", fontSize: 30, color: "#111" }}>
                  <span
                    style={{
                      display: "flex",
                      marginRight: 12,
                      fontWeight: 700,
                      color: l.sender === owner ? "#cc0000" : "#2a52be",
                    }}
                  >
                    {l.sender}:
                  </span>
                  <span style={{ display: "flex" }}>{l.body}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
