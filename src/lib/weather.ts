export type Weather = {
  tempF: number;
  label: string;
  emoji: string;
  city: string;
};

// Minimal WMO weather-code → label/emoji map.
function describe(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "clear", emoji: "☀️" };
  if (code <= 3) return { label: "partly cloudy", emoji: "⛅" };
  if (code <= 48) return { label: "foggy", emoji: "🌫️" };
  if (code <= 57) return { label: "drizzle", emoji: "🌦️" };
  if (code <= 67) return { label: "rainy", emoji: "🌧️" };
  if (code <= 77) return { label: "snowy", emoji: "❄️" };
  if (code <= 82) return { label: "showers", emoji: "🌧️" };
  if (code <= 86) return { label: "snow showers", emoji: "🌨️" };
  return { label: "stormy", emoji: "⛈️" };
}

/**
 * Current weather for the owner's city via Open-Meteo (no API key needed).
 * Location is configurable through env vars; falls back to NYC. Cached 30m.
 */
export async function fetchWeather(): Promise<Weather | null> {
  const lat = process.env.NEXT_PUBLIC_WEATHER_LAT ?? "40.71";
  const lon = process.env.NEXT_PUBLIC_WEATHER_LON ?? "-74.01";
  const city = process.env.NEXT_PUBLIC_WEATHER_CITY ?? "new york";

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    if (temp == null || code == null) return null;
    const { label, emoji } = describe(code);
    return { tempF: Math.round(temp), label, emoji, city };
  } catch {
    return null;
  }
}
