import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export const AUTH_ACCESS_COOKIE = "blog_auth_access_token";
export const AUTH_REFRESH_COOKIE = "blog_auth_refresh_token";

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export type WorkspaceRole = "admin" | "editor" | "contributor" | "viewer";

export type WorkspaceAccess = {
  user: User;
  workspaceId: string;
  role: WorkspaceRole;
};

export const EDITOR_ROLES: WorkspaceRole[] = ["admin", "editor"];

export function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

async function getUserFromAccessToken(accessToken: string): Promise<User | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) return null;
  return data.user ?? null;
}

export async function getAuthenticatedUserFromCookies(
  cookies: CookieReader,
): Promise<User | null> {
  const accessToken = cookies.get(AUTH_ACCESS_COOKIE)?.value;
  if (!accessToken) return null;
  return getUserFromAccessToken(accessToken);
}

export async function getAuthenticatedUser(
  req: NextRequest,
): Promise<User | null> {
  return getAuthenticatedUserFromCookies(req.cookies);
}

async function getWorkspaceAccessForUser(
  user: User,
  roles: WorkspaceRole[],
): Promise<WorkspaceAccess | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id,role")
    .eq("user_id", user.id)
    .in("role", roles)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    user,
    workspaceId: data.workspace_id as string,
    role: data.role as WorkspaceRole,
  };
}

export async function getWorkspaceAccessFromCookies(
  cookies: CookieReader,
  roles: WorkspaceRole[] = EDITOR_ROLES,
): Promise<WorkspaceAccess | null> {
  const user = await getAuthenticatedUserFromCookies(cookies);
  if (!user) return null;
  return getWorkspaceAccessForUser(user, roles);
}

export async function getWorkspaceAccess(
  req: NextRequest,
  roles: WorkspaceRole[] = EDITOR_ROLES,
): Promise<WorkspaceAccess | null> {
  const user = await getAuthenticatedUser(req);
  if (!user) return null;
  return getWorkspaceAccessForUser(user, roles);
}

export async function verifyAdminRequest(req: NextRequest): Promise<boolean> {
  return Boolean(await getWorkspaceAccess(req, EDITOR_ROLES));
}
