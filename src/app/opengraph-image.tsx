import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STAR_POINTS =
  "16,1 19.82,10.74 30.27,11.37 22.18,18.01 24.82,28.13 " +
  "16,22.5 7.18,28.13 9.82,18.01 1.73,11.37 12.18,10.74";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a2e",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            background: "#cc0000",
            marginBottom: 32,
          }}
        >
          <svg width={40} height={40} viewBox="0 0 32 32">
            <polygon points={STAR_POINTS} fill="#ffffff" />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
          soapie
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#a0a0c0", marginTop: 16 }}>
          a personal corner of the internet
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
