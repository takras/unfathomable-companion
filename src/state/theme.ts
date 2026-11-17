import { useState } from "react";

// Two looks: "night" (deep sea green, default) and "day" (parchment, like the cards).
export type Theme = "night" | "day";

const KEY = "unf-theme";

export function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "night" || saved === "day") return saved;
  } catch {
    // no storage
  }
  return "night";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "night" ? "#0d1a17" : "#efe6d2");
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const toggle = () => {
    const next: Theme = theme === "night" ? "day" : "night";
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
