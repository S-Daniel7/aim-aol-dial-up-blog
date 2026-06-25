import type { SiteCurrently } from "@/lib/types";

const ROWS: { key: keyof Omit<SiteCurrently, "updated_at">; label: string }[] = [
  { key: "reading", label: "reading" },
  { key: "watching", label: "watching" },
  { key: "listening", label: "listening" },
  { key: "thinking", label: "thinking" },
];

export function CurrentlyWidget({ currently }: { currently: SiteCurrently }) {
  const filled = ROWS.filter((r) => currently[r.key]);
  if (!filled.length) return null;

  return (
    <div
      className="border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div
        className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        currently
      </div>
      <div className="divide-y divide-border">
        {filled.map(({ key, label }) => (
          <div key={key} className="flex gap-3 px-3 py-2">
            <span
              className="w-20 shrink-0 font-mono text-xs uppercase tracking-widest text-muted pt-px"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              {label}
            </span>
            <span className="text-sm text-text leading-relaxed">{currently[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
