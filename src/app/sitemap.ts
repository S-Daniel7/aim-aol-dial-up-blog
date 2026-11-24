import { monthKey } from "@/lib/post-meta";
import { fetchPosts } from "@/lib/posts";
import type { MetadataRoute } from "next";

// Rebuild hourly so new posts show up without a redeploy.
export const revalidate = 3600;

const siteUrl =process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes = [
  "",
  "/live",
  "/about",
  "/board",
  "/guestbook",
  "/ask",
  "/stamps",
  "/links",
  "/stats",
  "/away",
  "/privacy",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPosts();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/post/${post.slug}`,
    lastModified: new Date(post.publish_at),
  }));

  const tags = new Set(posts.flatMap((post) => post.tags ?? []));
  const months = new Set(posts.map((post) => monthKey(post.publish_at)));
  const taxonomyEntries: MetadataRoute.Sitemap = [
    ...[...tags].map((tag) => ({ url: `${siteUrl}/tags/${tag}` })),
    ...[...months].map((m) => ({ url: `${siteUrl}/archive/${m}` })),
  ];

  return [...staticEntries, ...postEntries, ...taxonomyEntries];
}
