import { ActivityTimeline } from "@/components/ActivityTimeline";
import { BuddyListSidebar } from "@/components/BuddyListSidebar";
import { ChatRoomWindow } from "@/components/ChatRoomWindow";
import { CurrentlyWidget } from "@/components/CurrentlyWidget";
import { HitCounter } from "@/components/HitCounter";
import { NowPlayingWidget } from "@/components/NowPlayingWidget";
import { CountdownWidget } from "@/components/CountdownWidget";
import { RecentThoughts } from "@/components/RecentThoughts";
import { TypewriterIntro } from "@/components/TypewriterIntro";
import { getSupabasePublicConfig } from "@/lib/env";
import { fetchLiveFeedCountsByDate, fetchRecentLiveFeedEntries } from "@/lib/live-feed-db";
import { fetchMessagesForPosts, fetchPosts } from "@/lib/posts";
import { fetchAwayMessage } from "@/lib/status-db";
import Link from "next/link";
import { NudgeButton } from "@/components/NudgeButton";
import { TypingIndicator } from "@/components/TypingIndicator";
import { fetchCurrently, fetchCountdown, fetchMood } from "@/lib/site-widgets-db";

export const revalidate = 30;

export default async function Home() {
  const configured = !!getSupabasePublicConfig();
  const [posts, countsByDate, awayMessage, currently, mood, recentEntries, countdown] = configured
    ? await Promise.all([
        fetchPosts(),
        fetchLiveFeedCountsByDate(),
        fetchAwayMessage(),
        fetchCurrently(),
        fetchMood(),
        fetchRecentLiveFeedEntries(3),
        fetchCountdown(),
      ])
    : [[], {}, null, null, null, [], null];
  const byPost = configured
    ? await fetchMessagesForPosts((posts as { id: string }[]).map((p) => p.id))
    : {};

  const lastTended = (() => {
    const dates: string[] = [];
    if ((recentEntries as { created_at: string }[]).length)
      dates.push((recentEntries as { created_at: string }[])[0].created_at);
    if ((posts as { created_at: string }[]).length)
      dates.push((posts as { created_at: string }[])[0].created_at);
    dates.sort((a, b) => b.localeCompare(a));
    if (!dates[0]) return null;
    return new Date(dates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  })();

  return (
    <div className="space-y-6">
      {/* Intro box + away message + mood */}
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
            <TypewriterIntro />
            <p className="text-sm text-text leading-relaxed">
              a personal archive of aim chats, memories, and things i want to
              remember. posted by me, for anyone who stumbles upon it.
            </p>
            <p
              className="mt-2 font-mono text-xs text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              ★ sign my guestbook · add me to ur buddy list · xoxo
            </p>
          </div>
          <div className="flex items-center justify-between border-t border-border bg-surface-2 px-3 py-1.5">
            <HitCounter />
            {lastTended && (
              <p
                className="font-mono text-[10px] text-muted"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                last tended: {lastTended}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-52">
          {(awayMessage ?? mood) && (
            <div
              className="border-2 border-border bg-surface"
              style={{ boxShadow: "3px 3px 0 0 var(--border)" }}
            >
              <div
                className="flex items-center gap-2 border-b-2 border-border bg-title-bar px-2 py-1 font-heading text-sm text-title-bar-text"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="online-dot" />
                soapie is away
              </div>
              <div className="p-3 space-y-2">
                {awayMessage && (
                  <p
                    className="font-mono text-xs text-text leading-relaxed whitespace-pre-wrap"
                    style={{ fontFamily: "var(--font-mono-chat)" }}
                  >
                    {(awayMessage as { body: string }).body}<span className="blink">_</span>
                  </p>
                )}
                {mood && (
                  <p
                    className="font-mono text-[10px] text-muted border-t border-border pt-2"
                    style={{ fontFamily: "var(--font-mono-chat)" }}
                  >
                    current mood: {(mood as { mood: string }).mood}
                  </p>
                )}
              </div>
              <div className="border-t border-border px-3 py-1.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  {awayMessage && (
                    <p className="font-mono text-[9px] text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                      away since {new Date((awayMessage as { updated_at: string }).updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  )}
                  <Link
                    href="/away"
                    className="font-mono text-[9px] text-muted no-underline hover:text-accent ml-auto"
                    style={{ fontFamily: "var(--font-mono-chat)" }}
                  >
                    archive →
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <TypingIndicator />
                  <NudgeButton />
                </div>
              </div>
            </div>
          )}
          <BuddyListSidebar />
        </div>
      </div>

      {/* Countdown / days since */}
      <CountdownWidget initialData={countdown as import("@/lib/site-widgets-db").CountdownData | null} />

      {/* Spotify now playing */}
      <NowPlayingWidget />

      {/* Currently */}
      {currently && <CurrentlyWidget currently={currently as import("@/lib/types").SiteCurrently} />}

      {/* Recent thoughts */}
      {(recentEntries as unknown[]).length > 0 && (
        <RecentThoughts entries={recentEntries as import("@/lib/types").LiveFeedEntry[]} />
      )}

      {/* Activity timeline */}
      {configured && <ActivityTimeline countsByDate={countsByDate as Record<string, number>} />}

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
              <code className="border border-border bg-page-bg px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and{" "}
              <code className="border border-border bg-page-bg px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
              to <code className="border border-border bg-page-bg px-1">.env.local</code>, then restart.
            </p>
          </div>
        ) : (posts as unknown[]).length === 0 ? (
          <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            no posts yet · check back later!
          </p>
        ) : (
          <div className="space-y-6">
            {(posts as import("@/lib/types").DbPost[]).map((post) => (
              <ChatRoomWindow
                key={post.id}
                post={post}
                messages={(byPost as Record<string, import("@/lib/types").DbMessage[]>)[post.id] ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
