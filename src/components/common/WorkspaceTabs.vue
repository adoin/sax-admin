<script setup lang="ts">
import { STabs, STab, SButton, SContextMenu } from "sax-design-vue";
import type { ContextMenuInstance, ContextMenuItem } from "sax-design-vue";
import { computed, shallowRef, nextTick } from "vue";
import { RefreshCw, Pin } from "lucide-vue-next";
import { usePageWindows } from '@/components/workspace/page-windows';
import { useRoute, useRouter } from "vue-smart-router";
import { workspaceStore, tabCloseTargets } from "@/stores/workspace";
import type { TabCloseAction } from "@/stores/workspace";
import { preferencesStore } from "@/stores/preferences";
import { t } from "@/i18n";
const workspace = workspaceStore(),
  route = useRoute(),
  router = useRouter();
const preferences = preferencesStore();
const windows = usePageWindows();
const contextMenu = shallowRef<ContextMenuInstance>();
const contextPath = shallowRef("");
const closing = shallowRef(false);
function selectTab(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return;
  const path = String(value);
  if (windows.states.get(path)?.pinned) { windows.focus(path); return; }
  if (!closing.value && workspace.tabs.some((tab) => tab.fullPath === path))
    router.push(path);
}
const closeActions: TabCloseAction[] = [
  "current",
  "left",
  "right",
  "others",
  "all",
];
const menuItems = computed<ContextMenuItem[]>(() => [
  { label: t(windows.states.get(contextPath.value)?.pinned ? 'workspace.restoreWindow' : 'workspace.pinPage'), value: 'pin' },
  { label: t("workspace.refreshTab"), value: "refresh" },
  ...closeActions.map((action) => ({
    label: t(
      (
        {
          current: "workspace.closeCurrent",
          left: "workspace.closeLeft",
          right: "workspace.closeRight",
          others: "workspace.closeOthers",
          all: "workspace.closeAll",
        } as const
      )[action],
    ),
    value: action,
    disabled: !tabCloseTargets(workspace.tabs, contextPath.value, action)
      .length,
    divided: action === "current" || action === "all",
  })),
]);
function showContext(
  value: string | number,
  event: MouseEvent | KeyboardEvent,
) {
  const path = String(value);
  if (!workspace.tabs.some((tab) => tab.fullPath === path)) return;
  contextPath.value = path;
  const target =
    event.target instanceof HTMLElement
      ? event.target.closest<HTMLElement>('[role="tab"]') || event.target
      : undefined;
  contextMenu.value?.show(event, target);
}
function keyboardContext(event: KeyboardEvent) {
  if (event.key !== "ContextMenu" && !(event.key === "F10" && event.shiftKey))
    return;
  const target =
    event.target instanceof HTMLElement
      ? event.target.closest('[role="tab"]')
      : null;
  const path = target
    ?.querySelector("[data-workspace-tab]")
    ?.getAttribute("data-workspace-tab");
  if (path) showContext(path, event);
}
async function close(value: string | number) {
  if (closing.value) return;
  const path = String(value);
  const index = workspace.tabs.findIndex((tab) => tab.fullPath === path);
  if (index < 0) return;
  closing.value = true;
  try {
    if (route.fullPath === path) {
      const next = workspace.tabs.slice(0, index).reverse().find(tab => !windows.states.get(tab.fullPath)?.pinned)
        || workspace.tabs.slice(index + 1).find(tab => !windows.states.get(tab.fullPath)?.pinned);
      const failure = await router.push(next?.fullPath || "/launchpad");
      if (failure) return;
    }
    workspace.remove(path);
    await nextTick();
  } finally {
    closing.value = false;
  }
}
async function selectContext(item: ContextMenuItem) {
  if (item.value === 'pin') {
    if (windows.states.get(contextPath.value)?.pinned) await windows.restore(contextPath.value);
    else await windows.pin(contextPath.value);
    return;
  }
  if (item.value === "refresh") {
    workspace.refresh(contextPath.value);
    return;
  }
  const action = closeActions.find((value) => value === item.value);
  if (!action) return;
  if (closing.value) return;
  closing.value = true;
  try {
    const paths = tabCloseTargets(workspace.tabs, contextPath.value, action);
    const remaining = workspace.tabs.filter(
      (tab) => !paths.includes(tab.fullPath),
    );
    if (paths.includes(route.fullPath)) {
      const normal = remaining.filter(tab => !windows.states.get(tab.fullPath)?.pinned);
      const next = normal.find((tab) => tab.fullPath === contextPath.value) || normal.at(-1);
      const failure = await router.push(next?.fullPath || "/launchpad");
      if (failure) return;
    }
    workspace.retain(remaining.map((tab) => tab.fullPath));
    await nextTick();
  } finally {
    closing.value = false;
  }
}
</script>
<template>
  <div class="workspace-bar">
    <STabs
      class="workspace-tabs"
      :model-value="route.fullPath"
      :type="preferences.tabStyle"
      :size="preferences.tabSize"
      overflow="collapse"
      editable
      hide-add
      :animated="false"
      :aria-label="t('workspace.tabs')"
      @update:model-value="selectTab"
      @remove="close"
      @tab-contextmenu="showContext"
      @keydown="keyboardContext"
    >
      <STab
        v-for="tab in workspace.tabs"
        :key="tab.fullPath"
        :name="tab.fullPath"
        :label="windows.title(tab)"
        closable
      >
        <template #label
          ><span class="inline-flex items-center gap-1" :data-workspace-tab="tab.fullPath"><Pin v-if="windows.states.get(tab.fullPath)?.pinned" :size="12" :aria-label="t('workspace.pinned')" />{{ windows.title(tab) }}</span></template
        >
      </STab>
    </STabs>
    <div class="workspace-actions">
      <SButton v-if="workspace.tabs.some(tab => tab.fullPath === route.fullPath)" icon type="transparent" :debounce="false" :aria-label="t('workspace.pinPage')" @click="windows.pin(route.fullPath)"><Pin :size="16" /></SButton>
      <SButton
        icon
        type="transparent"
        :debounce="false"
        :aria-label="t('workspace.refresh')"
        @click="workspace.refresh(route.fullPath)"
        ><RefreshCw :size="16"
      /></SButton>
    </div>
  </div>
  <SContextMenu ref="contextMenu" :items="menuItems" @select="selectContext" />
</template>
<style scoped>
.workspace-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  width: 100%;
}
.workspace-tabs {
  flex: 1;
  min-width: 0;
}
.workspace-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.workspace-tabs :deep(.s-tabs__content) {
  display: none;
}
@media (max-width: 760px) {
  .workspace-bar {
    flex-wrap: wrap;
  }
  .workspace-tabs {
    flex-basis: 100%;
  }
  .workspace-actions {
    margin-left: auto;
  }
}
</style>
