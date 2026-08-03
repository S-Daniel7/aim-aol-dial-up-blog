import Image from "next/image";
import Link from "next/link";
import type { DbMessage, DbPost } from "@/lib/types";
import { PostReactions } from "@/components/PostReactions";

type Props = {
  post: DbPost;
  messages: DbMessage[];
  /** When true (default), title bar links to the post detail page. */
  linkToPost?: boolean;
};

const SENDER_COLORS = [
  "text-[#7b68ee]", // medium slate blue
  "text-[#20b2aa]", // light sea green
  "text-[#cd853f]", // peru
  "text-[#db7093]", // pale violet red
  "text-[#3cb371]", // medium sea green
  "text-[#9370db]", // medium purple
];

function getSenderColor(sender: string, palette: Map<string, string>): string {
  if (palette.has(sender)) return palette.get(sender)!;
  const color = SENDER_COLORS[palette.size % SENDER_COLORS.length];
  palette.set(sender, color);
  return color;
}

export function ChatRoomWindow({ post, messages, linkToPost = true }: Props) {
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
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => {
              const isOwner = m.sender.toLowerCase() === ownerHandle.toLowerCase();
              const color = isOwner
                ? "text-accent"
                : getSenderColor(m.sender, colorPalette);

              return (
                <div
                  key={m.id}
                  className={`animate-slide-in flex flex-col gap-0.5 ${isOwner ? "items-end" : "items-start"}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <p className={`text-[11px] font-semibold ${color}`}>
                    {m.sender}
                    {m.time_label ? (
                      <span className="ml-1.5 font-normal text-muted">({m.time_label})</span>
                    ) : null}
                  </p>

                  {m.kind === "text" ? (
                    <div
                      className={`max-w-[80%] inline-block rounded-sm px-2.5 py-1.5 leading-relaxed ${
                        isOwner
                          ? "bg-surface-2 border border-border"
                          : "bg-surface border border-border"
                      }`}
                    >
                      <span className="text-text">{m.body ?? ""}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {m.image_url ? (
                        <div className="inline-block border-2 border-border bg-page-bg p-1">
                          <Image
                            src={m.image_url}
                            alt={m.image_caption ?? ""}
                            width={400}
                            height={300}
                            className="h-auto max-w-full object-contain"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        </div>
                      ) : null}
                      {m.image_caption ? (
                        <p className="text-[11px] text-muted italic">{m.image_caption}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PostReactions postId={post.id} />
    </article>
  );
}
