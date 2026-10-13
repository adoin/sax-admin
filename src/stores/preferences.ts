import { defineStore } from "pinia";
export const tabStyles = ["line", "pill", "card", "editable-card"] as const;
export const tabSizes = ["small", "default", "large"] as const;
type TabStyle = (typeof tabStyles)[number];
type TabSize = (typeof tabSizes)[number];
function readTabStyle(): TabStyle {
  const value = localStorage.getItem("sax-tab-style");
  return tabStyles.find((style) => style === value) || "editable-card";
}
function readTabSize(): TabSize {
  const value = localStorage.getItem("sax-tab-size");
  return tabSizes.find((size) => size === value) || "small";
}
export const preferencesStore = defineStore("preferences", {
  state: () => ({
    collapsed: false,
    mobileOpen: false,
    dark: localStorage.getItem("sax-dark") === "true",
    tabStyle: readTabStyle(),
    tabSize: readTabSize(),
  }),
  actions: {
    setTabStyle(value: unknown) {
      const style = tabStyles.find((style) => style === value);
      if (!style) return;
      this.tabStyle = style;
      localStorage.setItem("sax-tab-style", style);
    },
    setTabSize(value: unknown) {
      const size = tabSizes.find((size) => size === value);
      if (!size) return;
      this.tabSize = size;
      localStorage.setItem("sax-tab-size", size);
    },
    toggleTheme() {
      this.dark = !this.dark;
      this.persistTheme();
    },
    persistTheme() {
      localStorage.setItem("sax-dark", String(this.dark));
      document.documentElement.classList.toggle("dark", this.dark);
      document.documentElement.classList.toggle("sax-dark", this.dark);
    },
  },
});
