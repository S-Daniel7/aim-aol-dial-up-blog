import { fetchPosts } from "@/lib/posts";

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = (await fetchPosts()).slice(0, 30);
  const items = posts
    .map((p) => {
      const url = `${siteUrl}/post/${p.slug}`;
      return `    <item>
      <title>${esc(p.title ?? "chat log")}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${esc(p.blurb ?? "a saved aim chat log")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>soapie</title>
    <link>${siteUrl}</link>
    <description>aim chat logs, live thoughts, and things to remember</description>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
