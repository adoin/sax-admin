export interface MenuInput {
  titleZh: string;
  titleEn: string;
  kind: "group" | "page";
  parentId: string;
  path: string;
  icon: string;
  order: number;
  enabled: boolean;
}
export interface AdminMenu extends MenuInput { id: string }
export const menuIcons = ["nav:layout-dashboard", "nav:users", "nav:shopping-bag", "nav:folder-kanban", "nav:list-checks", "nav:blocks", "nav:chart-no-axes-combined", "nav:map", "nav:settings-2", "nav:menu"] as const;
