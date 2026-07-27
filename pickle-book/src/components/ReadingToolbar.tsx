"use client";
import { useState } from "react";
import { useReaderSettings, BG_PRESETS, TEXT_PRESETS, FONT_OPTIONS } from "./ReaderSettings";

export default function ReadingToolbar() {
  const { settings, updateSettings, resetSettings } = useReaderSettings();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="sticky top-16 z-40 no-print border-b border-border" style={{ background: "var(--surface-color, #1e1e30)" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-10">
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--reader-color, #9ca3af)" }}>
            Reading
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label={collapsed ? "Expand reading toolbar" : "Collapse reading toolbar"}
          >
            <svg className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {!collapsed && (
          <div className="pb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {/* Font Family */}
            <div className="flex items-center gap-2">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>Font</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value as typeof settings.fontFamily })}
                className="px-2 py-1 rounded border border-white/20 bg-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-pickle-green"
                style={{ color: "var(--reader-color, #e5e7eb)" }}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>Size</label>
              <button
                onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
                className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors font-bold"
                style={{ color: "var(--reader-color, #e5e7eb)" }}
                aria-label="Decrease font size"
              >
                A-
              </button>
              <span className="w-8 text-center font-mono" style={{ color: "var(--reader-color, #e5e7eb)" }}>{settings.fontSize}</span>
              <button
                onClick={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
                className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors font-bold"
                style={{ color: "var(--reader-color, #e5e7eb)" }}
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Line Spacing */}
            <div className="flex items-center gap-1">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>Space</label>
              <button
                onClick={() => updateSettings({ lineSpacing: Math.max(1.2, +(settings.lineSpacing - 0.1).toFixed(1)) })}
                className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
                style={{ color: "var(--reader-color, #e5e7eb)" }}
                aria-label="Decrease line spacing"
              >
                &minus;
              </button>
              <span className="w-7 text-center font-mono" style={{ color: "var(--reader-color, #e5e7eb)" }}>{settings.lineSpacing}</span>
              <button
                onClick={() => updateSettings({ lineSpacing: Math.min(2.5, +(settings.lineSpacing + 0.1).toFixed(1)) })}
                className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 transition-colors"
                style={{ color: "var(--reader-color, #e5e7eb)" }}
                aria-label="Increase line spacing"
              >
                +
              </button>
            </div>

            {/* Reading Width */}
            <div className="flex items-center gap-1">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>Width</label>
              {(["narrow", "medium", "wide"] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => updateSettings({ readingWidth: w })}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    settings.readingWidth === w
                      ? "bg-pickle-green text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  style={settings.readingWidth !== w ? { color: "var(--reader-color, #e5e7eb)" } : undefined}
                >
                  {w.charAt(0).toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>

            {/* Background Color */}
            <div className="flex items-center gap-1">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>BG</label>
              {BG_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateSettings({ backgroundColor: preset.value })}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                    settings.backgroundColor === preset.value ? "border-pickle-green scale-110" : "border-white/30"
                  }`}
                  style={{ background: preset.value }}
                  aria-label={`Background: ${preset.name}`}
                  title={preset.name}
                />
              ))}
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer"
                  aria-label="Custom background color"
                />
                <span className="block w-5 h-5 rounded-full border-2 border-dashed border-white/40 hover:border-pickle-green transition-colors" title="Custom color" />
              </label>
            </div>

            {/* Font Color */}
            <div className="flex items-center gap-1">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>Text</label>
              {TEXT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateSettings({ fontColor: preset.value })}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                    settings.fontColor === preset.value ? "border-pickle-green scale-110" : "border-white/30"
                  }`}
                  style={{ background: preset.value }}
                  aria-label={`Text color: ${preset.name}`}
                  title={preset.name}
                />
              ))}
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={settings.fontColor}
                  onChange={(e) => updateSettings({ fontColor: e.target.value })}
                  className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer"
                  aria-label="Custom text color"
                />
                <span className="block w-5 h-5 rounded-full border-2 border-dashed border-white/40 hover:border-pickle-green transition-colors" title="Custom color" />
              </label>
            </div>

            {/* Theme */}
            <div className="flex items-center gap-1">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>Theme</label>
              <button
                onClick={() => updateSettings({ theme: "light" })}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${settings.theme === "light" ? "bg-pickle-green text-white" : "bg-white/10 hover:bg-white/20"}`}
                style={settings.theme !== "light" ? { color: "var(--reader-color, #e5e7eb)" } : undefined}
                aria-label="Light theme"
                title="Light"
              >
                ☀
              </button>
              <button
                onClick={() => updateSettings({ theme: "dark" })}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${settings.theme === "dark" ? "bg-pickle-green text-white" : "bg-white/10 hover:bg-white/20"}`}
                style={settings.theme !== "dark" ? { color: "var(--reader-color, #e5e7eb)" } : undefined}
                aria-label="Dark theme"
                title="Dark"
              >
                🌙
              </button>
              <button
                onClick={() => updateSettings({ theme: "sepia" })}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${settings.theme === "sepia" ? "bg-pickle-green text-white" : "bg-white/10 hover:bg-white/20"}`}
                style={settings.theme !== "sepia" ? { color: "var(--reader-color, #e5e7eb)" } : undefined}
                aria-label="Sepia theme"
                title="Sepia"
              >
                📜
              </button>
            </div>

            {/* Stickers Toggle */}
            <div className="flex items-center gap-2">
              <label className="font-medium" style={{ color: "var(--reader-color, #9ca3af)" }}>Stickers</label>
              <button
                onClick={() => updateSettings({ showStickers: !settings.showStickers })}
                className={`w-8 h-4 rounded-full transition-colors ${settings.showStickers ? "bg-pickle-green" : "bg-white/20"}`}
                aria-label={settings.showStickers ? "Hide stickers" : "Show stickers"}
              >
                <span className={`block w-3 h-3 bg-white rounded-full shadow transition-transform ${settings.showStickers ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={resetSettings}
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors font-medium"
              style={{ color: "var(--reader-color, #9ca3af)" }}
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
