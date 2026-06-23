import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const errorParam = req.nextUrl.searchParams.get("error");
  const stateParam = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get("spotify_oauth_state")?.value;

  // Verify CSRF state token before doing anything
  if (!expectedState || !stateParam || expectedState !== stateParam) {
    return htmlResponse("Invalid request", `<p class="error">Missing or mismatched state. Please restart the Spotify setup from the admin panel.</p>`);
  }

  if (errorParam || !code) {
    const res = htmlResponse("Spotify auth denied", `<p class="error">Spotify returned: ${esc(errorParam ?? "no code")}</p>`);
    res.cookies.delete("spotify_oauth_state");
    return res;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const res = htmlResponse("Config error", `<p class="error">SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set.</p>`);
    res.cookies.delete("spotify_oauth_state");
    return res;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const redirectUri = `${siteUrl}/api/spotify/callback`;

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const res = htmlResponse("Token exchange failed", `<p class="error">Spotify token exchange failed. Please try again.</p>`);
    res.cookies.delete("spotify_oauth_state");
    return res;
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
  };

  const res = htmlResponse(
    "Spotify connected!",
    `<p>Copy this refresh token into your <code>.env.local</code> file, then restart the dev server.</p>
     <div class="token-box">SPOTIFY_REFRESH_TOKEN=${esc(tokens.refresh_token)}</div>
     <p>You can close this tab after copying.</p>`,
  );
  res.cookies.delete("spotify_oauth_state");
  return res;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlResponse(title: string, body: string): NextResponse {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <style>
    body { font-family: "Courier New", monospace; background: #1a1a1a; color: #f5f5f5;
           max-width: 600px; margin: 60px auto; padding: 0 24px; }
    h1 { color: #cc0000; }
    code { background: #2d2d2d; padding: 2px 6px; }
    .token-box { background: #2d2d2d; border: 2px solid #cc0000; padding: 12px 16px;
                 margin: 16px 0; word-break: break-all; font-size: 13px; }
    .error { color: #ff6666; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  ${body}
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
