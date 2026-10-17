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
    if (stored === "dark" || stored === "light") return stored;
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "split-mode");
    root.classList.add(theme === "dark" ? "dark" : "light");
    localStorage.setItem(storageKey, theme === "dark" ? "dark" : "light");
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