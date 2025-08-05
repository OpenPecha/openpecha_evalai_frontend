import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "app-theme";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    return savedTheme || "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = () => {
      let actualTheme: "light" | "dark";

      if (theme === "system") {
        actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        actualTheme = theme;
      }

      setResolvedTheme(actualTheme);

      // Remove any existing theme classes
      root.classList.remove("light", "dark");
      // Add the current theme class
      root.classList.add(actualTheme);
    };

    updateTheme();

    // Listen for system theme changes when using 'system' theme
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateTheme();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setThemeAndPersist = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeAndPersist,
  };
};
