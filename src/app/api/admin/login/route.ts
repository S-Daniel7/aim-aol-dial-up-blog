import { ADMIN_COOKIE, expectedAdminToken } from "@/lib/admin-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const password = body.password ?? "";
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Server missing ADMIN_PASSWORD" },
      { status: 500 },
    );
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const token = expectedAdminToken();
  if (!token) {
    return NextResponse.json(
      { error: "Server missing ADMIN_SESSION_SECRET" },
      { status: 500 },
    );
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return NextResponse.json({ ok: true });
}
