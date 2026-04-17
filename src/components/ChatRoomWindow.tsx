import Image from "next/image";
import Link from "next/link";
import type { DbMessage, DbPost } from "@/lib/types";

type Props = {
  post: DbPost;
  messages: DbMessage[];
  /** When false, title links to the post page (home list). */
  linkToPost?: boolean;
};

export function ChatRoomWindow({
  post,
  messages,
  linkToPost = true,
}: Props) {
  const titleInner = (
    <span className="font-heading text-lg tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>
      Chat · {post.title}
    </span>
  );

  return (
    <article
      className="mb-8 border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div className="flex items-center justify-between border-b-2 border-border bg-title-bar px-3 py-2 text-title-bar-text">
        <div className="min-w-0 flex-1 truncate">
          {linkToPost ? (
            <Link
              href={`/post/${post.slug}`}
              className="text-inherit no-underline hover:underline"
            >
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
      <div className="border-b-2 border-border bg-surface-2 px-3 py-1 text-xs text-muted">
        Room logs ·{" "}
        {new Date(post.created_at).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </div>
      <div className="max-h-[480px] overflow-y-auto bg-chat-bg p-3 font-mono text-sm">
        {messages.length === 0 ? (
          <p className="text-muted">(no messages yet)</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id}>
                {m.kind === "text" ? (
                  <p className="leading-relaxed">
                    <span className="font-semibold text-accent">
                      {m.sender}
                    </span>
                    <span className="text-muted"> ({m.time_label})</span>
                    {": "}
                    <span className="text-text">{m.body ?? ""}</span>
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="leading-relaxed">
                      <span className="font-semibold text-accent">
                        {m.sender}
                      </span>
                      <span className="text-muted"> ({m.time_label})</span>
                      {m.image_caption ? (
                        <>
                          {": "}
                          <span className="text-text">{m.image_caption}</span>
                        </>
                      ) : null}
                    </p>
                    {m.image_url ? (
                      <div className="relative mt-1 inline-block max-w-full border-2 border-border bg-page-bg p-1">
                        <Image
                          src={m.image_url}
                          alt=""
                          width={400}
                          height={300}
                          className="h-auto max-w-full object-contain"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
