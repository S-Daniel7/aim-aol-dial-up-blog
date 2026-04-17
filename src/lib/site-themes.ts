/** Theme ids map to `[data-theme="…"]` blocks in `globals.css`. Add new ids there and here. */
export const SITE_THEMES = [
  { id: "classic", label: "Classic (MySpace-ish)" },
  { id: "aim-console", label: "AIM console" },
  { id: "high-contrast", label: "High contrast" },
] as const;

export type SiteThemeId = (typeof SITE_THEMES)[number]["id"];

export const DEFAULT_THEME: SiteThemeId = "classic";
