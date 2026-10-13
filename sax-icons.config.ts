import { defineSaxIconConfig } from "sax-design-vue-iconify";
export default defineSaxIconConfig({
  mode: "local",
  collections: { demo: "lucide" },
  safelist: ["demo:house", "demo:settings", "demo:chart-no-axes-combined"],
  autoRegister: true,
  strict: true,
});
