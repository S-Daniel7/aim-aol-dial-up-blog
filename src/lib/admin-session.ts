import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "blog_admin_session";

export function expectedAdminToken(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) return null;
  return createHmac("sha256", secret).update(password).digest("base64url");
}

export function verifyAdminRequest(req: NextRequest): boolean {
  const expected = expectedAdminToken();
  if (!expected) return false;
  const got = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!got) return false;
  try {
    const a = Buffer.from(got);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
