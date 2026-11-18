import { useState } from "react";

// The two rulebooks' paper: lavender (Rules Reference, default) and mint (Learn to Play).
export type Theme = "lavender" | "mint";

const THEMES: Theme[] = ["lavender", "mint"];
const PAPER: Record<Theme, string> = { lavender: "#e1e3ec", mint: "#dce7de" };
const KEY = "unf-theme";

export function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved && THEMES.includes(saved)) return saved;
  } catch {
    // no storage
  }
  return "lavender";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", PAPER[theme]);
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggle = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    applyTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // not remembered
    }
    setTheme(next);
  };
  return [theme, toggle];
}
