import type { Weather } from "@/lib/weather";

/**
 * Post-it styled weather note. Server-rendered from Open-Meteo data
 * passed in as a prop (no client fetch). Renders nothing if unavailable.
 */
export function WeatherNote({ weather }: { weather: Weather | null }) {
  if (!weather) return null;
  return (
    <div
      className="relative p-3 pt-4"
      style={{
        background: "#fef6a3",
        boxShadow: "3px 4px 8px 0 rgba(0,0,0,0.25)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 12,
          height: 12,
          background: "radial-gradient(circle at 35% 30%, #ff8a8a, #c81e1e 70%)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.4)",
        }}
      />
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden>
          {weather.emoji}
        </span>
        <div>
          <p
            className="font-mono text-lg font-bold leading-none"
            style={{ fontFamily: "var(--font-mono-chat)", color: "#3a3320" }}
          >
            {weather.tempF}°F
          </p>
          <p
            className="font-mono text-[10px]"
            style={{ fontFamily: "var(--font-mono-chat)", color: "#6b6142" }}
          >
            {weather.label}
          </p>
        </div>
      </div>
      <p
        className="mt-2 border-t pt-1.5 font-mono text-[10px]"
        style={{
          fontFamily: "var(--font-mono-chat)",
          color: "#6b6142",
          borderColor: "rgba(0,0,0,0.15)",
        }}
      >
        it&apos;s {weather.label} in {weather.city} rn
      </p>
    </div>
  );
}
