"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SETTINGS_LINKS = [
  { href: "/admin/status", label: "Status" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/links", label: "Links" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-36 shrink-0">
      <p className="mb-2 text-xs uppercase tracking-widest text-muted">Site</p>
      <nav className="flex flex-col gap-1 text-sm">
        {SETTINGS_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`no-underline hover:text-link-hover ${active ? "font-bold text-accent" : "text-link"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
