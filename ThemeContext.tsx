import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "high-contrast" | "oled-black";

interface ThemeContextProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isSystemAuto: boolean;
  setIsSystemAuto: (auto: boolean) => void;
  toggleTheme: () => void;
  isRtl: boolean;
  setIsRtl: (rtl: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Cross-Platform Persistence Mock for React Native compatibility
// In React Native, this translates to: import AsyncStorage from '@react-native-async-storage/async-storage';
const crossPlatformStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialLang?: "en" | "ar" }> = ({ children, initialLang = "en" }) => {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [isSystemAuto, setIsSystemAutoState] = useState<boolean>(false);
  const [isRtl, setIsRtlState] = useState<boolean>(initialLang === "ar");

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const savedTheme = await crossPlatformStorage.getItem("moka_theme");
      const savedAuto = await crossPlatformStorage.getItem("moka_theme_auto");
      const savedRtl = await crossPlatformStorage.getItem("moka_rtl");

      if (savedAuto === "true") {
        setIsSystemAutoState(true);
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeState(systemPrefersDark ? "dark" : "light");
      } else if (savedTheme) {
        setThemeState(savedTheme as ThemeMode);
      }

      if (savedRtl !== null) {
        setIsRtlState(savedRtl === "true");
      } else {
        setIsRtlState(initialLang === "ar");
      }
    };
    loadPreferences();
  }, [initialLang]);

  // Listen to system preference changes if auto-theme is enabled
  useEffect(() => {
    if (!isSystemAuto) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeState(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isSystemAuto]);

  // Apply theme attributes to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "high-contrast", "oled-black");
    root.classList.add(theme);

    // Apply color scheme metadata for system UI / status bars
    if (theme === "dark" || theme === "oled-black" || theme === "high-contrast") {
      root.style.colorScheme = "dark";
    } else {
      root.style.colorScheme = "light";
    }

    // Save choice
    crossPlatformStorage.setItem("moka_theme", theme);
  }, [theme]);

  // Handle RTL layout direction
  useEffect(() => {
    const root = document.documentElement;
    if (isRtl) {
      root.setAttribute("dir", "rtl");
      root.classList.add("rtl-mode");
    } else {
      root.setAttribute("dir", "ltr");
      root.classList.remove("rtl-mode");
    }
    crossPlatformStorage.setItem("moka_rtl", isRtl ? "true" : "false");
  }, [isRtl]);

  const setTheme = (newTheme: ThemeMode) => {
    setIsSystemAutoState(false);
    crossPlatformStorage.setItem("moka_theme_auto", "false");
    setThemeState(newTheme);
  };

  const setIsSystemAuto = (auto: boolean) => {
    setIsSystemAutoState(auto);
    crossPlatformStorage.setItem("moka_theme_auto", auto ? "true" : "false");
    if (auto) {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(systemPrefersDark ? "dark" : "light");
    }
  };

  const toggleTheme = () => {
    const themeCycle: ThemeMode[] = ["light", "dark", "oled-black", "high-contrast"];
    const currentIndex = themeCycle.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeCycle.length;
    setTheme(themeCycle[nextIndex]);
  };

  const setIsRtl = (rtl: boolean) => {
    setIsRtlState(rtl);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isSystemAuto,
        setIsSystemAuto,
        toggleTheme,
        isRtl,
        setIsRtl
      }}
    >
      <div className="theme-transition duration-300 min-h-screen bg-surface text-text-primary">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// React Native Compatible Helper Stubs
// These can be copy-pasted directly into a React Native codebase
export const getReactNativeStyles = (theme: ThemeMode) => {
  const tokens = {
    light: {
      primary: "#ea580c",
      secondary: "#475569",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#3b82f6",
      bgSurface: "#ffffff",
      bgElevated: "#f8fafc",
      bgOverlay: "rgba(255, 255, 255, 0.8)",
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textDisabled: "#94a3b8",
      textInverse: "#ffffff",
      borderDefault: "#e2e8f0",
      borderFocused: "#ea580c",
      borderError: "#ef4444"
    },
    dark: {
      primary: "#f97316",
      secondary: "#94a3b8",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#3b82f6",
      bgSurface: "#0f172a",
      bgElevated: "#1e293b",
      bgOverlay: "rgba(15, 23, 42, 0.8)",
      textPrimary: "#f8fafc",
      textSecondary: "#cbd5e1",
      textDisabled: "#64748b",
      textInverse: "#0f172a",
      borderDefault: "#334155",
      borderFocused: "#f97316",
      borderError: "#f87171"
    },
    "oled-black": {
      primary: "#f97316",
      secondary: "#a1a1aa",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#3b82f6",
      bgSurface: "#000000",
      bgElevated: "#09090b",
      bgOverlay: "rgba(0, 0, 0, 0.85)",
      textPrimary: "#ffffff",
      textSecondary: "#d4d4d8",
      textDisabled: "#52525b",
      textInverse: "#000000",
      borderDefault: "#27272a",
      borderFocused: "#f97316",
      borderError: "#ef4444"
    },
    "high-contrast": {
      primary: "#ea580c",
      secondary: "#ffffff",
      success: "#00ff00",
      warning: "#ffff00",
      danger: "#ff0000",
      info: "#00ffff",
      bgSurface: "#000000",
      bgElevated: "#000000",
      bgOverlay: "rgba(0, 0, 0, 0.95)",
      textPrimary: "#ffffff",
      textSecondary: "#ffff00",
      textDisabled: "#888888",
      textInverse: "#000000",
      borderDefault: "#ffffff",
      borderFocused: "#ffff00",
      borderError: "#ff0000"
    }
  };
  return tokens[theme] || tokens.light;
};
