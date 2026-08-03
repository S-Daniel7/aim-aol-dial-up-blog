"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Posts", exact: true },
  { href: "/admin/live", label: "Live feed" },
  { href: "/admin/board", label: "Board" },
  { href: "/admin/guestbook", label: "Guestbook" },
  { href: "/admin/ask", label: "Ask box" },
  { href: "/admin/stamps", label: "Stamps" },
];

export function AdminSubnav() {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 border-b-2 border-border pb-3 text-sm">
      <div className="flex flex-wrap gap-2">
        {NAV_LINKS.map(({ href, label, exact }, i) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <span key={href} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted">*</span>}
              <Link
                href={href}
                className={`no-underline hover:text-link-hover ${active ? "font-bold text-accent" : "text-link"}`}
              >
                {label}
              </Link>
            </span>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="ml-auto border border-border bg-surface-2 px-2 py-1 text-xs text-link hover:bg-page-bg"
      >
        Sign out
      </button>
    </nav>
  );
}
