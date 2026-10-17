/**
 * @file src/context/ThemeProvider.jsx
 * @description Theme context provider with dependable light/dark switching and local storage persistence.
 */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
  isDark: false,
});

export function ThemeProvider({ children, defaultTheme = "light", storageKey = "bihartenders-theme" }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "dark" || stored === "light" || stored === "split") return stored;
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "split-mode");
    if (theme === "split") {
      root.classList.add("split-mode");
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeProviderContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      isDark: theme === "dark",
      isSplit: theme === "split" 
    }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeProviderContext);