import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminSubnav } from "@/components/AdminSubnav";
import {
  EDITOR_ROLES,
  getWorkspaceAccessFromCookies,
} from "@/lib/admin-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PrivateAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const access = await getWorkspaceAccessFromCookies(jar, EDITOR_ROLES);
  if (!access) {
    redirect("/admin/login");
  }
  return (
    <div className="flex gap-8">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminSubnav />
        {children}
      </div>
    </div>
  );
}
