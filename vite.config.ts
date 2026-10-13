import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
export default defineConfig({
  plugins: [Vue(), UnoCSS()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "vue-router": "vue-smart-router",
    },
    dedupe: ["vue", "pinia"],
  },
  server: { port: 7869, strictPort: true },
  preview: { port: 7869, strictPort: true },
  build: { target: "es2022", chunkSizeWarningLimit: 1500 },
});
