import {
  computed,
  inject,
  nextTick,
  onScopeDispose,
  provide,
  reactive,
  shallowRef,
  watch,
} from "vue";
import type { InjectionKey } from "vue";
import { useRoute, useRouter } from "vue-smart-router";
import type { Router, RouteLocationNormalizedLoaded } from 'vue-smart-router';
import { workspaceStore } from "@/stores/workspace";
import type { WorkspaceTab } from "@/stores/workspace";
import type { WindowRect } from "sax-design-vue";
import { t } from "@/i18n";

export const PAGE_WINDOW_MIN_WIDTH = 320;
export const PAGE_WINDOW_MIN_HEIGHT = 220;

export interface PageWindowState {
  pinned: boolean;
  alias: string;
  rect: WindowRect;
  zIndex: number;
  focusVersion: number;
  viewportPositioned: boolean;
}
export function createPageWindowManager(
  workspace: Pick<ReturnType<typeof workspaceStore>, 'tabs' | 'remove'>,
  route: Pick<RouteLocationNormalizedLoaded, 'fullPath'>,
  router: Pick<Router, 'push' | 'beforeEach'>,
) {
  const states = reactive(new Map<string, PageWindowState>());
  const routeTabs = computed(() => workspace.tabs.filter(tab => !states.get(tab.fullPath)?.pinned));
  let sequence = 1;
  const activePath = shallowRef("");
  let restoringPath: string | undefined;
  let workspaceBounds = (): WindowRect | undefined => undefined;
  const state = (path: string): PageWindowState => {
    if (!states.has(path)) {
      const offset = (states.size % 6) * 28;
      states.set(path, {
        pinned: false,
        alias: "",
        rect: { x: 20 + offset, y: 20 + offset, width: 760, height: 520 },
        zIndex: 1,
        focusVersion: 0,
        viewportPositioned: false,
      });
    }
    return states.get(path)!;
  };
  const title = (tab: WorkspaceTab) =>
    states.get(tab.fullPath)?.alias ||
    t(tab.title, tab.titleId ? { id: tab.titleId } : {});
  const activate = (path: string) => {
    const item = state(path);
    if (activePath.value !== path) {
      activePath.value = path;
      item.zIndex = ++sequence;
    }
  };
  const focus = (path: string) => {
    activate(path);
    state(path).focusVersion++;
  };
  const nextPage = (excluded: string) =>
    workspace.tabs.find(
      (tab) => tab.fullPath !== excluded && !states.get(tab.fullPath)?.pinned,
    )?.fullPath || "/launchpad";
  async function pin(path: string) {
    if (!workspace.tabs.some((tab) => tab.fullPath === path)) return;
    if (state(path).pinned) {
      focus(path);
      return;
    }
    const item = state(path);
    if (!item.viewportPositioned) {
      const bounds = workspaceBounds();
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        const width = Math.max(PAGE_WINDOW_MIN_WIDTH, bounds.width * 0.9);
        const height = Math.max(PAGE_WINDOW_MIN_HEIGHT, bounds.height * 0.9);
        item.rect = {
          x: bounds.x + Math.max(0, (bounds.width - width) / 2),
          y: bounds.y + Math.max(0, (bounds.height - height) / 2),
          width,
          height,
        };
      }
      item.viewportPositioned = true;
    }
    item.pinned = true;
    activate(path);
    await nextTick();
    if (route.fullPath === path) await router.push(nextPage(path));
    focus(path);
  }
  async function restore(path: string) {
    if (!states.get(path)?.pinned) return;
    restoringPath = path;
    try {
      if (route.fullPath !== path) {
        const failure = await router.push(path);
        if (failure) return;
      }
      state(path).pinned = false;
    } finally {
      restoringPath = undefined;
    }
  }
  async function close(path: string) {
    if (route.fullPath === path) {
      const failure = await router.push(nextPage(path));
      if (failure) return;
    }
    workspace.remove(path);
  }
  watch(
    () => workspace.tabs.map((tab) => tab.fullPath),
    (paths) => {
      for (const path of states.keys())
        if (!paths.includes(path)) states.delete(path);
    },
  );
  // A link or history entry to an already pinned page focuses its existing
  // instance. Only the explicit restore action moves it back into the route.
  onScopeDispose(
    router.beforeEach((to) => {
      if (states.get(to.fullPath)?.pinned && restoringPath !== to.fullPath) {
        focus(to.fullPath);
        return false;
      }
    }),
  );
  const api = {
    setWorkspaceBounds: (getBounds: () => WindowRect | undefined) => { workspaceBounds = getBounds; },
    routeTabs,
    state,
    states,
    title,
    rename: (path: string, value: string) => {
      const alias = value.trim();
      if (!alias || !workspace.tabs.some(tab => tab.fullPath === path)) return false;
      state(path).alias = alias;
      return true;
    },
    activate,
    focus,
    pin,
    restore,
    close,
    isActive: (path: string) => activePath.value === path,
  };
  return api;
}
export function createPageWindows() {
  const api = createPageWindowManager(workspaceStore(), useRoute(), useRouter());
  provide(pageWindowsKey, api);
  return api;
}
type PageWindows = ReturnType<typeof createPageWindowManager>;
const pageWindowsKey: InjectionKey<PageWindows> = Symbol.for("sax-admin.page-windows");
export function usePageWindows() {
  const value = inject(pageWindowsKey);
  if (!value) throw new Error("Page windows require an Admin workspace");
  return value;
}
