import { defineSaxIconConfig } from "sax-design-vue-iconify";
import { menuIcons } from "./src/api/menu-contracts.ts";
export default defineSaxIconConfig({
  mode: "api",
  api: { baseUrl: "https://api.iconify.design" },
  collections: { demo: "lucide", nav: "lucide" },
  safelist: [
    ...menuIcons,
    "demo:house",
    "demo:settings",
    "demo:chart-no-axes-combined",
  ],
  autoRegister: true,
  strict: true,
});
