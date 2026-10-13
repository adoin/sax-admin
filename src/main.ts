import { createApp } from "vue";
import SaxDesign from "sax-design-vue";
import "sax-design-vue/dist/index.css";
import "sax-design-vue/theme-chalk/dark/css-vars.css";
import "virtual:uno.css";
import "./styles/base.css";
import App from "./App.vue";
import { pinia } from "./stores";
import { router } from "./router";
import { preferencesStore } from "./stores/preferences";
import { watchEffect } from "vue";
import { i18n, locale, t } from "./i18n";
import type { MessageKey } from "./i18n/messages";
preferencesStore(pinia).persistTheme();
watchEffect(() => {
  document.documentElement.lang = locale.value;
  document.title = `${t((router.currentRoute.value.meta.title || "section.workspace") as MessageKey)} · Sax Admin`;
});
createApp(App).use(pinia).use(i18n).use(router).use(SaxDesign).mount("#app");
