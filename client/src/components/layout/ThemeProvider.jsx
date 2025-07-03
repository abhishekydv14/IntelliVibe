import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext(null)

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const applySystemTheme = () => {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.remove("light", "dark")
        root.classList.add(systemTheme)
      }
      applySystemTheme();
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", applySystemTheme);
      return () => mql.removeEventListener("change", applySystemTheme);
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}