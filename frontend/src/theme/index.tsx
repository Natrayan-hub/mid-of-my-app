// Global theme provider: resolves system|light|dark (Preference S25),
// persists the choice, exposes tokens via useTheme(). Components import
// tokens only from here — never raw hex.
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { useColorScheme } from "react-native";

import { storage } from "@/src/utils/storage";
import { dark, light, Theme } from "./tokens";

export type ThemeMode = "system" | "light" | "dark";

const THEME_MODE_KEY = "lifeos.theme.mode";

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  resolvedScheme: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<ThemeMode>(THEME_MODE_KEY, "system");
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved);
      }
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    storage.setItem(THEME_MODE_KEY, next);
  }, []);

  const resolvedScheme: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedScheme === "dark" ? dark : light,
      mode,
      resolvedScheme,
      setMode,
    }),
    [mode, resolvedScheme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { Theme } from "./tokens";
