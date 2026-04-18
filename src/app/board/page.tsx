import { BoardCanvas } from "@/components/BoardCanvas";
import { fetchBoardItems } from "@/lib/board-db";
import { getSupabasePublicConfig } from "@/lib/env";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Board",
  description: "Digital pin board",
};

export default async function BoardPage() {
  const configured = !!getSupabasePublicConfig();
  const items = configured ? await fetchBoardItems() : [];

  return (
    <div>
      {!configured ? (
        <div className="mb-8 border-2 border-border bg-surface p-4 text-sm">
          <p className="font-semibold text-accent">Supabase not configured</p>
          <p className="mt-2 text-muted">
            Add env keys and run the board section from{" "}
            <code className="border border-border bg-page-bg px-1">
              supabase/schema.sql
            </code>
            .
          </p>
        </div>
      ) : null}
      <BoardCanvas items={items} />
    </div>
  );
}
