import { ChatRoomWindow } from "@/components/ChatRoomWindow";
import { fetchPostBySlug } from "@/lib/posts";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchPostBySlug(slug);
  if (!data) return { title: "Not found" };
  return { title: `${data.post.title} · chat log` };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchPostBySlug(slug);
  if (!data) notFound();

  return (
    <div>
      <ChatRoomWindow
        post={data.post}
        messages={data.messages}
        linkToPost={false}
      />
      <p className="text-sm text-muted">
        <Link href="/">← back to all rooms</Link>
      </p>
    </div>
  );
}
