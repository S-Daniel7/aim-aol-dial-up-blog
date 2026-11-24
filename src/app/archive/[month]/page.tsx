import { ChatRoomWindow } from "@/components/ChatRoomWindow";
import { isValidMonthKey } from "@/lib/post-meta";
import { fetchMessagesForPosts, fetchPostsByMonth } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ month: string }> };

function label(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  return { title: isValidMonthKey(month) ? `Archive: ${label(month)}` : "Not found" };
}

export default async function ArchivePage({ params }: Props) {
  const { month } = await params;
  if (!isValidMonthKey(month)) notFound();

  const posts = await fetchPostsByMonth(month);
  if (posts.length === 0) notFound();
  const messages = await fetchMessagesForPosts(posts.map((p) => p.id));

  return (
    <div>
      <h1
        className="mb-4 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {label(month)}
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
