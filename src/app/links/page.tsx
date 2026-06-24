import { createPublicClient } from "@/lib/supabase/public";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Links",
  description: "sites, things, and places i like",
};

type SiteLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  order_index: number;
};

export default async function LinksPage() {
  const supabase = createPublicClient();
  const { data } = supabase
    ? await supabase
        .from("site_links")
        .select("id,title,url,description,category,order_index")
        .order("category")
        .order("order_index")
        .order("created_at")
    : { data: [] };

  const links = (data ?? []) as SiteLink[];

  const grouped = links.reduce<Record<string, SiteLink[]>>((acc, l) => {
    (acc[l.category] ??= []).push(l);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* links &amp; things *~
        </h1>
        <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          sites, music, books, and corners of the internet i like
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          nothing here yet — check back soon!
        </p>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div
              key={cat}
              className="border-2 border-border bg-surface"
              style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
            >
              <div
                className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {cat}
              </div>
              <div className="divide-y divide-border">
                {grouped[cat].map((link, i) => (
                  <div
                    key={link.id}
                    className="animate-slide-in px-4 py-3"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-link no-underline hover:underline hover:text-link-hover"
                      style={{ fontFamily: "var(--font-mono-chat)" }}
                    >
                      › {link.title}
                    </a>
                    {link.description && (
                      <p
                        className="mt-0.5 font-mono text-xs text-muted"
                        style={{ fontFamily: "var(--font-mono-chat)" }}
                      >
                        {link.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p
        className="border-t border-border pt-4 font-mono text-[10px] text-muted"
        style={{ fontFamily: "var(--font-mono-chat)" }}
      >
        ✦ if you want to be on here,{" "}
        <Link href="/guestbook" className="text-link no-underline hover:underline">
          sign the guestbook
        </Link>{" "}
        and say hi!
      </p>
    </div>
  );
}
