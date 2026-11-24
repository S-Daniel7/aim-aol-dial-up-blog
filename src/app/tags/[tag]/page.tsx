import { ChatRoomWindow } from "@/components/ChatRoomWindow";
import { fetchMessagesForPosts, fetchPostsByTag } from "@/lib/posts";
import { parseTags } from "@/lib/post-meta";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ tag: string }> };

/** Only canonical tag slugs are valid URLs; anything else is a 404. */
function normaliseTag(raw: string): string | null {
  const decoded = decodeURIComponent(raw);
  const [tag] = parseTags(decoded);
  return tag && tag === decoded ? tag : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = normaliseTag((await params).tag);
  return { title: tag ? `#${tag}` : "Not found" };
}

export default async function TagPage({ params }: Props) {
  const tag = normaliseTag((await params).tag);
  if (!tag) notFound();

  const posts = await fetchPostsByTag(tag);
  if (posts.length === 0) notFound();
  const messages = await fetchMessagesForPosts(posts.map((p) => p.id));

  return (
    <div>
      <h1
        className="mb-4 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        #{tag}
      </h1>
      {posts.map((post) => (
        <ChatRoomWindow key={post.id} post={post} messages={messages[post.id] ?? []} />
      ))}
      <p className="text-sm text-muted">
        <Link href="/">← back to all rooms</Link>
      </p>
    </div>
  );
}
