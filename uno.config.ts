import { defineConfig, presetWind3 } from "unocss";
export default defineConfig({
  presets: [presetWind3()],
  theme: {
    colors: { brand: "#2563eb", muted: "#748198" },
    fontFamily: { sans: 'Inter, "Segoe UI", "Microsoft YaHei", sans-serif' },
  },
  shortcuts: {
    panel:
      "bg-white rounded-5 p-6 shadow-[0_4px_24px_rgba(28,49,86,0.035)] dark:bg-slate-900",
    "page-title":
      "text-7 font-700 tracking-tight text-slate-800 dark:text-slate-100",
    "page-caption": "text-sm text-muted mt-2 leading-6",
    "section-title": "text-base font-650 text-slate-800 dark:text-slate-100",
    "icon-button":
      "w-10 h-10 flex items-center justify-center border-0 bg-transparent rounded-3 text-muted hover:bg-blue-50 hover:text-brand cursor-pointer dark:hover:bg-slate-800",
    "field-label": "text-sm font-500 text-slate-600 dark:text-slate-300",
  },
});
