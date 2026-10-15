import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import Vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { saxIcons } from "sax-design-vue-iconify/vite";
import iconConfig from "./sax-icons.config.ts";
import { iconBuildAudit } from "./scripts/icon-build-audit.ts";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "SAX_");
  const icons = {
    ...iconConfig,
    api: {
      ...iconConfig.api,
      baseUrl: env.SAX_ICON_API_URL || iconConfig.api.baseUrl,
    },
  };
  return {
    plugins: [saxIcons(icons), Vue(), UnoCSS(), iconBuildAudit()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "vue-router": "vue-smart-router",
      },
      dedupe: ["vue", "pinia", "sax-design-vue-iconify"],
    },
    server: { port: 7869, strictPort: true },
    preview: { port: 7869, strictPort: true },
    build: { target: "es2022", chunkSizeWarningLimit: 1500 },
  };
});
