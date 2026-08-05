import type { Weather } from "@/lib/weather";

/**
 * Post-it styled weather note. Server-rendered from Open-Meteo data
 * passed in as a prop (no client fetch). Renders nothing if unavailable.
 */
export function WeatherNote({ weather }: { weather: Weather | null }) {
  if (!weather) return null;
  return (
    <div
      className="border border-border p-3"
      style={{
        background: "var(--surface-2)",
        boxShadow: "3px 3px 0 0 var(--border)",
        transform: "rotate(-1.5deg)",
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden>
          {weather.emoji}
        </span>
        <div>
          <p
            className="font-mono text-lg font-bold leading-none text-text"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {weather.tempF}°F
          </p>
          <p
            className="font-mono text-[10px] text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {weather.label}
          </p>
        </div>
      </div>
      <p
        className="mt-2 border-t border-border pt-1.5 font-mono text-[10px] text-muted"
        style={{ fontFamily: "var(--font-mono-chat)" }}
      >
        it&apos;s {weather.label} in {weather.city} rn
      </p>
    </div>
  );
}
