import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
  /** Right-aligned content in the title bar (links, buttons, window chrome). */
  accessory?: ReactNode;
  /** "md" = page-level window (default), "sm" = compact gadget window. */
  size?: "md" | "sm";
  className?: string;
};

const SIZES = {
  md: { shadow: "4px 4px 0 0 var(--border)", bar: "px-3 py-2 text-lg" },
  sm: { shadow: "3px 3px 0 0 var(--border)", bar: "px-2 py-1 text-sm" },
} as const;

/**
 * The site's one shared AIM-style window frame: bordered box, hard drop shadow,
 * and a themed title bar. Use this instead of re-typing the border/shadow markup.
 */
export function RetroWindow({ title, children, accessory, size = "md", className = "" }: Props) {
  const s = SIZES[size];
  return (
    <div
      className={`border-2 border-border bg-surface ${className}`.trim()}
      style={{ boxShadow: s.shadow }}
    >
      <div
        className={`flex items-center justify-between border-b-2 border-border bg-title-bar font-heading text-title-bar-text ${s.bar}`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span>{title}</span>
        {accessory}
      </div>
      {children}
    </div>
  );
}
