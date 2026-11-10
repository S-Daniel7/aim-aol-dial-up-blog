import type { SiteCurrently } from "@/lib/types";
import { RetroWindow } from "@/components/RetroWindow";

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
    <RetroWindow title="currently">
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
    </RetroWindow>
  );
}
