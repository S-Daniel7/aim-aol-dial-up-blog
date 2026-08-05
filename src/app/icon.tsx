import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// A five-pointed star drawn as an SVG polygon so no external font is fetched
// (the ★ text glyph isn't in Satori's default font and failed to render).
const STAR_POINTS =
  "16,1 19.82,10.74 30.27,11.37 22.18,18.01 24.82,28.13 " +
  "16,22.5 7.18,28.13 9.82,18.01 1.73,11.37 12.18,10.74";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#cc0000",
        }}
      >
        <svg width={32} height={32} viewBox="0 0 32 32">
          <polygon points={STAR_POINTS} fill="#ffffff" />
        </svg>
      </div>
    ),
    { width: 32, height: 32 },
  );
}
