import { ChatRoomWindow } from "@/components/ChatRoomWindow";
import { fetchPostBySlug } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPostBySlug(slug);
  if (!data) return { title: "Not found" };
  return { title: data.post.title ?? "chat log" };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchPostBySlug(slug);
  if (!data) notFound();

  return (
    <div>
      <p
        className="mb-3 font-mono text-[10px] text-muted"
        style={{ fontFamily: "var(--font-mono-chat)" }}
      >
        <Link href="/" className="hover:text-accent">
          home
        </Link>{" "}
        / {data.post.title ?? "chat log"}
      </p>
      <ChatRoomWindow
        post={data.post}
        messages={data.messages}
        linkToPost={false}
        animated
      />
      <p className="text-sm text-muted">
        <Link href="/">← back to all rooms</Link> &nbsp;·&nbsp;{" "}
        <Link href="/board">pinboard</Link> &nbsp;·&nbsp;{" "}
        <Link href="/guestbook">sign the guestbook</Link>
      </p>
    </div>
  );
}
