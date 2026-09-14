import React from "react";
import { OverlayTheme } from "../types";
import { Palette, Sliders, Type, Sparkles } from "lucide-react";

interface AppearanceSettingsProps {
  theme: OverlayTheme;
  onUpdateTheme: (newTheme: OverlayTheme) => Promise<void>;
}

const PRESET_THEMES = [
  { name: "Onyx Minimal", card: "#0a0c10", text: "#ffffff", accent: "#60a5fa" },
  { name: "Midnight Obsidian", card: "#09090b", text: "#f4f4f5", accent: "#f59e0b" },
  { name: "Cyber Violet", card: "#130f26", text: "#f5f3ff", accent: "#a855f7" },
  { name: "Emerald Focus", card: "#041c14", text: "#ecfdf5", accent: "#10b981" },
  { name: "Nord Frost", card: "#0f172a", text: "#f8fafc", accent: "#38bdf8" },
  { name: "Monochrome Pitch", card: "#000000", text: "#ededed", accent: "#ffffff" },
];

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const updateThemeField = <K extends keyof OverlayTheme>(key: K, value: OverlayTheme[K]) => {
    onUpdateTheme({
      ...theme,
      [key]: value,
    });
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    onUpdateTheme({
      ...theme,
      cardColor: preset.card,
      textColor: preset.text,
      accentColor: preset.accent,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Preset Themes Card */}
      <div className="bg-[#0b0d12] border border-neutral-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/60 text-sm font-semibold text-white">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Curated Color Presets</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-4">
          {PRESET_THEMES.map((preset) => {
            const isSelected =
              theme.cardColor === preset.card && theme.accentColor === preset.accent;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-sky-500/80 bg-sky-500/10 shadow-md"
                    : "border-neutral-800 bg-black/40 hover:border-neutral-700 hover:bg-black/60"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: preset.card }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-[11px] font-medium text-neutral-300 truncate w-full text-center">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Palette */}
      <div className="bg-[#0b0d12] border border-neutral-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/60 text-sm font-semibold text-white">
          <Palette className="w-4 h-4 text-sky-400" />
          <span>Custom Palette</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {/* Card color */}
          <div>
            <label className="block text-xs text-neutral-400 font-medium mb-1.5">Card Background</label>
            <div className="flex items-center gap-2 bg-black/60 border border-neutral-800 rounded-xl px-2.5 py-2">
              <input
                type="color"
                value={theme.cardColor || "#0a0c10"}
                onChange={(e) => updateThemeField("cardColor", e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={theme.cardColor || "#0a0c10"}
                onChange={(e) => updateThemeField("cardColor", e.target.value)}
                className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Text color */}
          <div>
            <label className="block text-xs text-neutral-400 font-medium mb-1.5">Text Color</label>
            <div className="flex items-center gap-2 bg-black/60 border border-neutral-800 rounded-xl px-2.5 py-2">
              <input
                type="color"
                value={theme.textColor || "#ffffff"}
                onChange={(e) => updateThemeField("textColor", e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={theme.textColor || "#ffffff"}
                onChange={(e) => updateThemeField("textColor", e.target.value)}
                className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label className="block text-xs text-neutral-400 font-medium mb-1.5">Accent Color</label>
            <div className="flex items-center gap-2 bg-black/60 border border-neutral-800 rounded-xl px-2.5 py-2">
              <input
                type="color"
                value={theme.accentColor || "#60a5fa"}
                onChange={(e) => updateThemeField("accentColor", e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={theme.accentColor || "#60a5fa"}
                onChange={(e) => updateThemeField("accentColor", e.target.value)}
                className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none uppercase"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Geometry, Glassmorphism & Sizing */}
      <div className="bg-[#0b0d12] border border-neutral-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/60 text-sm font-semibold text-white">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Sticky Widget Dimensions & Glassmorphism</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mt-4">
          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
              <span>Card Width</span>
              <span className="font-mono text-neutral-500">{theme.width ?? 440}px</span>
            </div>
            <input
              type="range"
              min="200"
              max="800"
              value={theme.width ?? 440}
              onChange={(e) => updateThemeField("width", Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
              <span>Corner Roundness</span>
              <span className="font-mono text-neutral-500">{theme.radius ?? 20}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              value={theme.radius ?? 20}
              onChange={(e) => updateThemeField("radius", Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
              <span>Internal Padding</span>
              <span className="font-mono text-neutral-500">{theme.padding ?? 20}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="48"
              value={theme.padding ?? 20}
              onChange={(e) => updateThemeField("padding", Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
              <span>Glass Opacity</span>
              <span className="font-mono text-neutral-500">{theme.opacity ?? 96}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={theme.opacity ?? 96}
              onChange={(e) => updateThemeField("opacity", Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
              <span>Backdrop Blur</span>
              <span className="font-mono text-neutral-500">{theme.blur ?? 20}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={theme.blur ?? 20}
              onChange={(e) => updateThemeField("blur", Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1.5 font-medium">
              <span>Item Spacing</span>
              <span className="font-mono text-neutral-500">{theme.spacing ?? 12}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              value={theme.spacing ?? 12}
              onChange={(e) => updateThemeField("spacing", Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Typography & Display Behavior */}
      <div className="bg-[#0b0d12] border border-neutral-800/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800/60 text-sm font-semibold text-white">
          <Type className="w-4 h-4 text-sky-400" />
          <span>Typography & Task Styles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1 font-medium">Font Family</label>
            <select
              value={theme.font || "inter"}
              onChange={(e) => updateThemeField("font", e.target.value)}
              className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="inter">Inter (Clean Modern)</option>
              <option value="jakarta">Plus Jakarta Sans</option>
              <option value="space">JetBrains Mono</option>
              <option value="serif">Georgia Serif</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1 font-medium">Progress Style</label>
            <select
              value={theme.progressStyle || "both"}
              onChange={(e) => updateThemeField("progressStyle", e.target.value)}
              className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="both">Bar and fraction (e.g. 2/5)</option>
              <option value="bar">Bar only</option>
              <option value="fraction">Fraction only</option>
              <option value="none">Hidden</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1 font-medium">Completed Task Style</label>
            <select
              value={theme.completedStyle || "strike"}
              onChange={(e) => updateThemeField("completedStyle", e.target.value)}
              className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="strike">Strikethrough & Dim</option>
              <option value="dim">Dim text only</option>
              <option value="tick">Checkmark only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1 font-medium">Task Density</label>
            <select
              value={theme.density || "comfortable"}
              onChange={(e) => updateThemeField("density", e.target.value)}
              className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact (High density)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1 font-medium">Motion Animations</label>
            <select
              value={theme.animation || "subtle"}
              onChange={(e) => updateThemeField("animation", e.target.value)}
              className="w-full bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="subtle">Subtle & Smooth</option>
              <option value="playful">Playful</option>
              <option value="none">None (Instant)</option>
            </select>
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={theme.showTitle ?? true}
                onChange={(e) => updateThemeField("showTitle", e.target.checked)}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
              <span className="text-xs text-neutral-300 font-medium">Show List Title</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
