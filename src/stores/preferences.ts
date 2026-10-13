import { defineStore } from "pinia";
export const preferencesStore = defineStore("preferences", {
  state: () => ({
    collapsed: false,
    mobileOpen: false,
    dark: localStorage.getItem("sax-dark") === "true",
  }),
  actions: {
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
