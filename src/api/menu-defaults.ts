import { navigation } from "@/router/navigation";
import { zh, en } from "@/i18n/messages";
import type { AdminMenu } from "./menu-contracts";
const groups = ["section.workspace", "section.insights", "section.examples", "section.system"] as const;
const icons: Record<string, string> = { LayoutDashboard: "nav:layout-dashboard", Users: "nav:users", ShoppingBag: "nav:shopping-bag", FolderKanban: "nav:folder-kanban", ListChecks: "nav:list-checks", Blocks: "nav:blocks", ChartNoAxesCombined: "nav:chart-no-axes-combined", Map: "nav:map", Settings2: "nav:settings-2" };
export const groupIcons: Record<string, string> = {
  'section.workspace': 'nav:briefcase-business',
  'section.insights': 'nav:chart-no-axes-combined',
  'section.examples': 'nav:flask-conical',
  'section.system': 'nav:settings-2',
};
export function defaultMenus(): AdminMenu[] {
  return [
    ...groups.map((section, order): AdminMenu => ({ id: section, titleZh: zh[section], titleEn: en[section], kind: "group", parentId: "", path: "", icon: groupIcons[section]!, order, enabled: true })),
    ...navigation.map((item, order): AdminMenu => ({ id: `page:${item.path}`, titleZh: zh[item.label], titleEn: en[item.label], kind: "page", parentId: item.section, path: item.path, icon: icons[item.icon] || "nav:menu", order, enabled: true })),
  ];
}
