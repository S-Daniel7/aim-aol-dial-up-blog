import type { ReactNode } from "react";
import { RetroWindow } from "@/components/RetroWindow";

/** Compact window frame for the homepage side gadgets. */
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
    <RetroWindow size="sm" title={title} accessory={accessory}>
      {children}
    </RetroWindow>
  );
}
