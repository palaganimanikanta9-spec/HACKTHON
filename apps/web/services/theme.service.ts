import { useSmartSaveStore } from "@/store/use-smartsave-store";

export const themeService = {
  getTheme: () => {
    return useSmartSaveStore.getState().settings.theme;
  },

  setTheme: (theme: "dark" | "light" | "system") => {
    useSmartSaveStore.getState().setTheme(theme);
    // Apply changes directly to document element
    const resolvedTheme =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(resolvedTheme);
  },
};
