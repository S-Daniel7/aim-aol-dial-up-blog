import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SCOPES = "user-read-currently-playing user-read-recently-played";

export async function GET(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID not set in .env.local" },
      { status: 500 },
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const redirectUri = `${siteUrl}/api/spotify/callback`;

  const state = randomUUID();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`,
  );
  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 5 * 60,
    path: "/",
  });
  return response;
}
