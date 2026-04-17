import { AdminSubnav } from "@/components/AdminSubnav";
import { ADMIN_COOKIE, expectedAdminToken } from "@/lib/admin-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PrivateAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = expectedAdminToken();
  if (!token) {
    redirect("/admin/login");
  }
  const jar = await cookies();
  if (jar.get(ADMIN_COOKIE)?.value !== token) {
    redirect("/admin/login");
  }
  return (
    <>
      <AdminSubnav />
      {children}
    </>
  );
}
