import { defineStore } from "pinia";
import type { RouteLocationNormalizedLoaded } from "vue-smart-router";
import type { MessageKey } from "@/i18n/messages";

export interface WorkspaceTab {
  fullPath: string;
  title: MessageKey;
  titleId?: string;
  revision: number;
}
export type TabCloseAction = "current" | "left" | "right" | "others" | "all";
export function tabCloseTargets(tabs: WorkspaceTab[], path: string, action: TabCloseAction): string[] {
  const index = tabs.findIndex((tab) => tab.fullPath === path);
  if (index < 0) return [];
  return tabs.filter((_tab, position) => (
    action === "all" ||
    (action === "current" && position === index) ||
    (action === "left" && position < index) ||
    (action === "right" && position > index) ||
    (action === "others" && position !== index)
  )).map((tab) => tab.fullPath);
}
export const workspaceStore = defineStore("workspace", {
  state: () => ({ tabs: [] as WorkspaceTab[], editorEnabled: true, nextDraft: 3 }),
  getters: {
    cacheNames: (state) => state.tabs.map((tab) => `${tab.fullPath}::${tab.revision}`),
  },
  actions: {
    visit(route: RouteLocationNormalizedLoaded) {
      if (!route.matched.some((record) => record.name === "admin") || !route.name || route.meta.tabless) return;
      if (!this.tabs.some((tab) => tab.fullPath === route.fullPath)) {
        this.tabs.push({
          fullPath: route.fullPath,
          title: route.meta.title as MessageKey,
          titleId: route.name === "workspace-draft" ? String(route.params.id) : undefined,
          revision: 0,
        });
      }
    },
    cacheName(fullPath: string) {
      const tab = this.tabs.find((item) => item.fullPath === fullPath);
      return tab ? `${tab.fullPath}::${tab.revision}` : undefined;
    },
    remove(fullPath: string) {
      this.tabs = this.tabs.filter((tab) => tab.fullPath !== fullPath);
    },
    retain(fullPaths: string[]) {
      this.tabs = this.tabs.filter((tab) => fullPaths.includes(tab.fullPath));
    },
    refresh(fullPath: string) {
      const tab = this.tabs.find((item) => item.fullPath === fullPath);
      if (tab) tab.revision++;
    },
    reset() { this.tabs = []; },
  },
});
