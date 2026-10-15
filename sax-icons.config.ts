import { defineSaxIconConfig } from "sax-design-vue-iconify";
export default defineSaxIconConfig({
  mode: "api",
  api: { baseUrl: "https://api.iconify.design" },
  collections: { demo: "lucide", nav: "lucide" },
  safelist: [
    "demo:house",
    "demo:settings",
    "demo:chart-no-axes-combined",
    "nav:layout-dashboard",
    "nav:users",
    "nav:shopping-bag",
    "nav:folder-kanban",
    "nav:list-checks",
    "nav:blocks",
    "nav:chart-no-axes-combined",
    "nav:map",
    "nav:settings-2",
    "nav:menu",
  ],
  autoRegister: true,
  strict: true,
});
