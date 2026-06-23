import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
  authCookieOptions,
} from "@/lib/admin-session";
import { getAdminEmail } from "@/lib/env";
import { isRateLimited } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    "unknown";

  if (await isRateLimited("login", ip, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait 15 minutes." },
      { status: 429 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  // Allowlist check — deny if ADMIN_EMAIL not configured (fail closed)
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }
  if (email !== adminEmail.toLowerCase()) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Auth not configured" },
      { status: 500 },
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = data.session;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    AUTH_ACCESS_COOKIE,
    session.access_token,
    authCookieOptions(session.expires_in),
  );
  response.cookies.set(
    AUTH_REFRESH_COOKIE,
    session.refresh_token,
    authCookieOptions(60 * 60 * 24 * 30),
  );
  return response;
}
