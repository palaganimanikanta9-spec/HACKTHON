"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Theme } from "@/types";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Apply theme to DOM
  const applyTheme = (t: "dark" | "light") => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(t);
    setResolvedTheme(t);
  };

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("smartsave-theme") as Theme | null;
    const initial = stored ?? "dark";
    setThemeState(initial);

    if (initial === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches ? "dark" : "light");
    } else {
      applyTheme(initial as "dark" | "light");
    }
  }, []);

  // Listen for system changes
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("smartsave-theme", newTheme);

    if (newTheme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches ? "dark" : "light");
    } else {
      applyTheme(newTheme as "dark" | "light");
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
