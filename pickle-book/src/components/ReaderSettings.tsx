"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ReaderSettings } from "@/lib/types";
const SETTINGS_KEY = "pickle-book-settings";
const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 16,
  lineSpacing: 1.8,
  readingWidth: "medium",
  theme: "light",
  showStickers: true,
};
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
  const updateSettings = useCallback((partial: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);
  return (
    <ReaderSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      <div
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineSpacing,
        }}
      >
        {children}
      </div>
    </ReaderSettingsContext.Provider>
  );
}
