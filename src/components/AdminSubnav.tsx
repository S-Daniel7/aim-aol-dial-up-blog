"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminSubnav() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 border-b-2 border-border pb-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin"
          className="text-link no-underline hover:text-link-hover"
        >
          Chat-room posts
        </Link>
        <span className="text-muted">*</span>
        <Link
          href="/admin/live"
          className="text-link no-underline hover:text-link-hover"
        >
          Live feed
        </Link>
        <span className="text-muted">*</span>
        <Link
          href="/admin/board"
          className="text-link no-underline hover:text-link-hover"
        >
          Board
        </Link>
        <span className="text-muted">*</span>
        <Link
          href="/admin/guestbook"
          className="text-link no-underline hover:text-link-hover"
        >
          Guestbook
        </Link>
        <span className="text-muted">*</span>
        <Link
          href="/admin/status"
          className="text-link no-underline hover:text-link-hover"
        >
          Status
        </Link>
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
