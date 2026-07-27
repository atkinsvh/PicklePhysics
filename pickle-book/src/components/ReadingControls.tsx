"use client";
import { useState } from "react";
import { useReaderSettings } from "./ReaderSettings";
export default function ReadingControls() {
  const { settings, updateSettings, resetSettings } = useReaderSettings();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md text-muted hover:text-pickle-green hover:bg-pickle-light transition-colors"
        aria-label="Reading settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-semibold text-sm text-foreground mb-4">Reading Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min={12}
                max={24}
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-pickle-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Line Spacing: {settings.lineSpacing}
              </label>
              <input
                type="range"
                min={1.2}
                max={2.5}
                step={0.1}
                value={settings.lineSpacing}
                onChange={(e) => updateSettings({ lineSpacing: parseFloat(e.target.value) })}
                className="w-full accent-pickle-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Reading Width</label>
              <div className="flex gap-2">
                {(["narrow", "medium", "wide"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => updateSettings({ readingWidth: w })}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      settings.readingWidth === w
                        ? "bg-pickle-green text-white border-pickle-green"
                        : "border-border text-muted hover:border-pickle-green"
                    }`}
                  >
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Theme</label>
              <div className="flex gap-2">
                {(["light", "dark", "sepia"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateSettings({ theme: t })}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      settings.theme === t
                        ? "bg-pickle-green text-white border-pickle-green"
                        : "border-border text-muted hover:border-pickle-green"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted">Show Stickers</label>
              <button
                onClick={() => updateSettings({ showStickers: !settings.showStickers })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings.showStickers ? "bg-pickle-green" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    settings.showStickers ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <button
              onClick={resetSettings}
              className="w-full text-xs text-muted hover:text-pickle-green transition-colors py-1"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
