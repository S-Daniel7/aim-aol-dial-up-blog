"use client";

import { DEFAULT_THEME, type SiteThemeId } from "@/lib/site-themes";
import { useEffect } from "react";

const STORAGE_KEY = "blog-site-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SiteThemeId | null;
    const theme = stored ?? DEFAULT_THEME;
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return children;
}
