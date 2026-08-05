import type { ReactNode } from "react";

/** Shared retro window frame for the homepage side gadgets. */
export function GadgetWindow({
  title,
  children,
  accessory,
}: {
  title: string;
  children: ReactNode;
  accessory?: ReactNode;
}) {
  return (
    <div
      className="border-2 border-border bg-surface"
      style={{ boxShadow: "3px 3px 0 0 var(--border)" }}
    >
      <div
        className="flex items-center justify-between border-b-2 border-border bg-title-bar px-2 py-1"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span className="font-heading text-sm text-title-bar-text">{title}</span>
        {accessory}
      </div>
      {children}
    </div>
  );
}
