import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ChatRoomWindow } from "@/components/ChatRoomWindow";
import { NowPlayingWidget } from "@/components/NowPlayingWidget";
import { getSupabasePublicConfig } from "@/lib/env";
import { fetchLiveFeedCountsByDate } from "@/lib/live-feed-db";
import { fetchMessagesForPosts, fetchPosts } from "@/lib/posts";
import { fetchAwayMessage } from "@/lib/status-db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const configured = !!getSupabasePublicConfig();
  const [posts, countsByDate, awayMessage] = configured
    ? await Promise.all([
        fetchPosts(),
        fetchLiveFeedCountsByDate(),
        fetchAwayMessage(),
      ])
    : [[], {}, null];
  const byPost = configured
    ? await fetchMessagesForPosts(posts.map((p) => p.id))
    : {};

  return (
    <div className="space-y-6">
      {/* Intro box + away message */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div
          className="border-2 border-border bg-surface"
          style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
        >
          <div
            className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ~* welcome to my page *~
          </div>
          <div className="p-4">
            <pre
              className="mb-3 font-mono text-[11px] text-muted leading-tight"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >{`  .・。.・゜✭・.・✫・゜・。.
  this is my little corner of the internet
  .・。.・゜✭・.・✫・゜・。.`}</pre>
            <p className="text-sm text-text leading-relaxed">
              a personal archive of aim chats, memories, and things i want to
              remember. posted by me, for me (and maybe for you too).
            </p>
            <p
              className="mt-2 font-mono text-xs text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              ★ sign my guestbook · add me to ur buddy list · xoxo
            </p>
          </div>
        </div>

        {awayMessage && (
          <div
            className="border-2 border-border bg-surface lg:w-52"
            style={{ boxShadow: "3px 3px 0 0 var(--border)" }}
          >
            <div
              className="border-b-2 border-border bg-title-bar px-2 py-1 font-heading text-sm text-title-bar-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              soapie is away
            </div>
            <div className="p-3">
              <p
                className="font-mono text-xs text-text leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                {awayMessage.body}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Spotify now playing — client component, fetches and self-hides */}
      <NowPlayingWidget />

      {/* Activity timeline */}
      {configured && <ActivityTimeline countsByDate={countsByDate} />}

      {/* Posts */}
      <div>
        <h1
          className="mb-1 font-heading text-2xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          chat logs
        </h1>
        <p
          className="mb-5 border-l-4 border-border pl-3 font-mono text-xs text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          saved aim convos w/ timestamps and screen names
        </p>

        {!configured ? (
          <div className="border-2 border-border bg-surface p-4 text-sm">
            <p className="font-semibold text-accent">Supabase not configured</p>
            <p className="mt-2 text-muted">
              Add{" "}
              <code className="border border-border bg-page-bg px-1">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="border border-border bg-page-bg px-1">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              to{" "}
              <code className="border border-border bg-page-bg px-1">
                .env.local
              </code>
              , then restart.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <p
            className="font-mono text-sm text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            no posts yet · head to admin to add one
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <ChatRoomWindow
                key={post.id}
                post={post}
                messages={byPost[post.id] ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
