import { defineStore } from "pinia";
import type { MenuOption } from "sax-design-vue";
import { menusApi } from "@/api/menus";
import type { AdminMenu } from "@/api/menu-contracts";
import { defaultMenus } from "@/api/menu-defaults";
import { locale } from "@/i18n";
export function menuLabel(row: AdminMenu) { return locale.value === "zh-CN" ? row.titleZh : row.titleEn; }
export const menusStore = defineStore("menus", {
  state: () => ({ records: defaultMenus(), busy: false, error: "", selectedId: "" }),
  getters: {
    visiblePages(): AdminMenu[] {
      const keys = new Set<string>();
      const visit = (options: MenuOption[]) => options.forEach((option) => { keys.add(String(option.key)); if (option.children) visit(option.children); });
      visit(this.options);
      return this.records.filter((row) => row.kind === 'page' && keys.has(row.id));
    },
    options(state): MenuOption[] {
      const build = (parentId: string, seen = new Set<string>()): MenuOption[] => state.records.filter((row) => row.parentId === parentId && row.enabled && !seen.has(row.id)).sort((a, b) => a.order - b.order).map((row) => ({
        key: row.id, label: menuLabel(row), icon: row.icon || undefined,
        children: row.kind === "group" ? build(row.id, new Set([...seen, row.id])) : undefined,
      }));
      return build("");
    },
  },
  actions: {
    async refresh() {
      this.busy = true; this.error = "";
      try { this.records = await menusApi.list(); }
      catch (error) { this.error = error instanceof Error ? error.message : ""; }
      finally { this.busy = false; }
    },
  },
});
