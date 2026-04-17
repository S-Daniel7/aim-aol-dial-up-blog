"use client";

import {
  DEFAULT_THEME,
  SITE_THEMES,
  type SiteThemeId,
} from "@/lib/site-themes";
import { useEffect, useState } from "react";

const STORAGE_KEY = "blog-site-theme";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<SiteThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SiteThemeId | null;
    const initial = stored ?? DEFAULT_THEME;
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function onChange(next: SiteThemeId) {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted whitespace-nowrap">Theme</span>
      <select
        value={theme}
        onChange={(e) => onChange(e.target.value as SiteThemeId)}
        className="border-2 border-border bg-surface px-2 py-1 text-text"
      >
        {SITE_THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}
