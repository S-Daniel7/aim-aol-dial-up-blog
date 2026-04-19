import { ChatRoomWindow } from "@/components/ChatRoomWindow";
import { getSupabasePublicConfig } from "@/lib/env";
import { fetchMessagesForPosts, fetchPosts } from "@/lib/posts";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const configured = !!getSupabasePublicConfig();
  const posts = configured ? await fetchPosts() : [];
  const byPost = configured
    ? await fetchMessagesForPosts(posts.map((p) => p.id))
    : {};

  return (
    <div>
      <h1
        className="mb-2 font-heading text-3xl tracking-wide text-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        ~* hello aol myspace blog thing  *~
      </h1>
      <p className="mb-6 border-l-4 border-accent pl-3 text-sm text-muted">
        Chat-room posts. Each entry is a saved log with timestamps and handles.
      </p>

      {!configured ? (
        <div className="border-2 border-border bg-surface p-4 text-sm">
          <p className="font-semibold text-accent">Supabase not configured</p>
          <p className="mt-2 text-muted">
            Add{" "}
            <code className="border border-border bg-page-bg px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="border border-border bg-page-bg px-1">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            to <code className="border border-border bg-page-bg px-1">.env.local</code>, run{" "}
            <code className="border border-border bg-page-bg px-1">supabase/schema.sql</code>{" "}
            on your project, then restart the dev server.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-muted">
          No posts yet. Head to <Link href="/admin">admin</Link> after logging in.
        </p>
      ) : (
        posts.map((post) => (
          <ChatRoomWindow
            key={post.id}
            post={post}
            messages={byPost[post.id] ?? []}
          />
        ))
      )}
    </div>
  );
}
