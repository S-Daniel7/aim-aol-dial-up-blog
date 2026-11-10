import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ACCESS_COOKIE } from "@/lib/admin-session";

// Fast, edge-level defense-in-depth for the private admin pages. This only
// checks that a session cookie is present — it does not verify the token or
// role. The authoritative check (token validity + workspace role) happens
// server-side in src/app/admin/(private)/layout.tsx and in each protected
// API route via getWorkspaceAccess(). This middleware exists so that a
// future admin page added under /admin without going through that layout
// still can't be reached unauthenticated.
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(AUTH_ACCESS_COOKIE)?.value);
  if (!hasSession) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
