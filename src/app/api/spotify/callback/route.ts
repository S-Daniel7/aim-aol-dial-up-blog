import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return new NextResponse(
      html("Spotify auth denied", `<p class="error">Spotify returned: ${error ?? "no code"}</p>`),
      { headers: { "Content-Type": "text/html" } },
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      html("Config error", `<p class="error">SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set.</p>`),
      { headers: { "Content-Type": "text/html" } },
    );
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
    const text = await tokenRes.text();
    return new NextResponse(
      html("Token exchange failed", `<p class="error">Spotify said: ${text}</p>`),
      { headers: { "Content-Type": "text/html" } },
    );
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
  };

  return new NextResponse(
    html(
      "Spotify connected!",
      `<p>Copy this refresh token into your <code>.env.local</code> file, then restart the dev server.</p>
       <div class="token-box">SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}</div>
       <p>You can close this tab after copying.</p>`,
    ),
    { headers: { "Content-Type": "text/html" } },
  );
}

function html(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
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
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}
