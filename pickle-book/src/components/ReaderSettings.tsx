"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ReaderSettings, FontFamilyOption } from "@/lib/types";

const SETTINGS_KEY = "pickle-book-settings";

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineSpacing: 1.8,
  readingWidth: "medium",
  theme: "dark",
  showStickers: true,
  backgroundColor: "#1a1a2e",
  fontColor: "#e5e7eb",
  fontFamily: "lato",
};

export const BG_PRESETS: { name: string; value: string }[] = [
  { name: "White", value: "#ffffff" },
  { name: "Cream", value: "#fef9ef" },
  { name: "Sepia", value: "#f5f0e6" },
  { name: "Light Gray", value: "#f3f4f6" },
  { name: "Dark", value: "#1a1a2e" },
  { name: "Midnight", value: "#0f0f1a" },
];

export const TEXT_PRESETS: { name: string; value: string }[] = [
  { name: "Default Dark", value: "#171717" },
  { name: "Warm Brown", value: "#3d2b1f" },
  { name: "Cool Gray", value: "#6b7280" },
  { name: "Light", value: "#e5e7eb" },
  { name: "High Contrast", value: "#ffffff" },
  { name: "Soft Cream", value: "#fef3c7" },
];

export const FONT_OPTIONS: { label: string; value: FontFamilyOption; css: string }[] = [
  { label: "Lato", value: "lato", css: "var(--font-lato), sans-serif" },
  { label: "Lobster", value: "lobster", css: "var(--font-lobster), cursive" },
  { label: "Cinzel", value: "cinzel", css: "var(--font-cinzel), serif" },
  { label: "Serif", value: "serif", css: "Georgia, 'Times New Roman', serif" },
  { label: "Sans", value: "sans-serif", css: "system-ui, -apple-system, sans-serif" },
  { label: "Mono", value: "monospace", css: "'Courier New', monospace" },
];

interface ReaderSettingsContextType {
  settings: ReaderSettings;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
}

const ReaderSettingsContext = createContext<ReaderSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});

export function useReaderSettings() {
  return useContext(ReaderSettingsContext);
}

function loadSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty("--reader-bg", settings.backgroundColor);
    root.style.setProperty("--reader-color", settings.fontColor);
    root.style.setProperty("--reader-font", FONT_OPTIONS.find(f => f.value === settings.fontFamily)?.css || "var(--font-lato), sans-serif");
    root.style.setProperty("--reader-font-size", `${settings.fontSize}px`);
    root.style.setProperty("--reader-line-height", `${settings.lineSpacing}`);
  }, [settings, mounted]);

  const updateSettings = useCallback((partial: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <ReaderSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </ReaderSettingsContext.Provider>
  );
}
