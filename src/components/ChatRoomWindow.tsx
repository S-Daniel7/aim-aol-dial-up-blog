import Link from "next/link";
import type { DbMessage, DbPost } from "@/lib/types";
import { PostReactions } from "@/components/PostReactions";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatReplay } from "@/components/ChatReplay";
import { getSenderColor } from "@/lib/chat-colors";

type Props = {
  post: DbPost;
  messages: DbMessage[];
  /** When true (default), title bar links to the post detail page. */
  linkToPost?: boolean;
  /** When true, messages replay one-by-one with a typing indicator instead of rendering instantly. */
  animated?: boolean;
};

export function ChatRoomWindow({ post, messages, linkToPost = true, animated = false }: Props) {
  const ownerHandle = post.my_handle ?? process.env.NEXT_PUBLIC_SCREEN_NAME ?? "soapie";

  const titleInner = (
    <span
      className="font-heading text-lg tracking-wide"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {post.title}
    </span>
  );

  // Assign a stable color to each unique non-owner sender
  const colorPalette = new Map<string, string>();

  return (
    <article
      className="card-lift mb-8 border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b-2 border-border bg-title-bar px-3 py-2 text-title-bar-text">
        <div className="min-w-0 flex-1 truncate">
          {linkToPost ? (
            <Link href={`/post/${post.slug}`} className="text-inherit no-underline hover:underline">
              {titleInner}
            </Link>
          ) : (
            titleInner
          )}
        </div>
        <div className="flex gap-1 pl-2 text-xs opacity-90" aria-hidden>
          <span className="border border-title-bar-text px-1">_</span>
          <span className="border border-title-bar-text px-1">□</span>
          <span className="border border-title-bar-text px-1">×</span>
        </div>
      </div>

      {/* Meta bar */}
      <div className="border-b-2 border-border bg-surface-2 px-3 py-1 text-xs text-muted">
        {post.blurb ? (
          <span className="mr-3 italic text-text">{post.blurb}</span>
        ) : null}
        <span>
          {new Date(post.created_at).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
        </span>
      </div>

      {/* Message area */}
      <div className="max-h-[520px] overflow-y-auto bg-chat-bg p-4 font-mono text-sm">
        {messages.length === 0 ? (
          <p className="text-muted">(no messages yet)</p>
        ) : animated ? (
          <ChatReplay messages={messages} ownerHandle={ownerHandle} postId={post.id} />
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => {
              const isOwner = m.sender.toLowerCase() === ownerHandle.toLowerCase();
              const color = isOwner
                ? "text-accent"
                : getSenderColor(m.sender, colorPalette);

              return (
                <ChatMessage
                  key={m.id}
                  message={m}
                  isOwner={isOwner}
                  color={color}
                  className="animate-slide-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                />
              );
            })}
          </div>
        )}
      </div>

      <PostReactions postId={post.id} />
    </article>
  );
}
