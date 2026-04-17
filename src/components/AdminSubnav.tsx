import Link from "next/link";

export function AdminSubnav() {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b-2 border-border pb-3 text-sm">
      <Link
        href="/admin"
        className="text-link no-underline hover:text-link-hover"
      >
        Chat-room posts
      </Link>
      <span className="text-muted">·</span>
      <Link
        href="/admin/live"
        className="text-link no-underline hover:text-link-hover"
      >
        Live feed
      </Link>
    </nav>
  );
}
