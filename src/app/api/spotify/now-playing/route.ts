import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type SpotifyTrack = {
  name: string;
  artist: string;
  url: string;
  albumArt: string | null;
  isPlaying: boolean;
};

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string | null> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

function pickAlbumArt(images: { url: string; width: number }[]): string | null {
  if (!images?.length) return null;
  // prefer smallest image (index 2 = ~64px), fall back to largest
  return (images[2] ?? images[images.length - 1])?.url ?? null;
}

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({ track: null });
  }

  const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
  if (!accessToken) return NextResponse.json({ track: null });

  const authHeader = { Authorization: `Bearer ${accessToken}` };

  // Try currently playing first
  const cpRes = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: authHeader, cache: "no-store" },
  );

  if (cpRes.ok && cpRes.status !== 204) {
    const cp = (await cpRes.json()) as {
      is_playing: boolean;
      item?: {
        type: string;
        name: string;
        artists: { name: string }[];
        external_urls: { spotify: string };
        album: { images: { url: string; width: number }[] };
      };
    };
    if (cp.item?.type === "track") {
      return NextResponse.json({
        track: {
          name: cp.item.name,
          artist: cp.item.artists.map((a) => a.name).join(", "),
          url: cp.item.external_urls.spotify,
          albumArt: pickAlbumArt(cp.item.album.images),
          isPlaying: cp.is_playing,
        } satisfies SpotifyTrack,
      });
    }
  }

  // Fallback: most recently played track
  const rpRes = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    { headers: authHeader, cache: "no-store" },
  );

  if (rpRes.ok) {
    const rp = (await rpRes.json()) as {
      items?: {
        track: {
          name: string;
          artists: { name: string }[];
          external_urls: { spotify: string };
          album: { images: { url: string; width: number }[] };
        };
      }[];
    };
    const item = rp.items?.[0]?.track;
    if (item) {
      return NextResponse.json({
        track: {
          name: item.name,
          artist: item.artists.map((a) => a.name).join(", "),
          url: item.external_urls.spotify,
          albumArt: pickAlbumArt(item.album.images),
          isPlaying: false,
        } satisfies SpotifyTrack,
      });
    }
  }

  return NextResponse.json({ track: null });
}
