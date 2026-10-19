<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from "vue";
import { RouterView, useRoute } from "vue-smart-router";
import { SScrollbar } from "sax-design-vue";
import { workspaceStore } from "@/stores/workspace";
import WorkspacePageHost from "./WorkspacePageHost.vue";
import { usePageWindows } from "./page-windows";
const workspace = workspaceStore();
const route = useRoute();
const tabless = computed(() => !!route.meta.tabless);
const windows = usePageWindows();
const workspaceElement = useTemplateRef<HTMLElement>("workspaceElement");
const windowLayer = useTemplateRef<HTMLElement>("windowLayer");
onMounted(() => windows.setWorkspaceBounds(() => {
  const rect = workspaceElement.value?.getBoundingClientRect();
  return rect ? { x: rect.left, y: rect.top, width: rect.width, height: rect.height } : undefined;
}));
onBeforeUnmount(() => windows.setWorkspaceBounds(() => undefined));
</script>

<template>
  <div ref="workspaceElement" class="relative flex-1 min-h-0 isolate" data-page-workspace>
    <WorkspacePageHost
      v-for="tab in workspace.tabs"
      :key="`${tab.fullPath}::${tab.revision}`"
      :tab="tab"
      :window-layer="windowLayer"
    />
    <SScrollbar
      v-if="tabless"
      class="admin-page-scroll relative z-0"
      wrap-class="s-layout-body"
      height="100%"
      placement="outside"
      :gap="3"
      :always="false"
    >
      <div class="py-7 md:py-8 admin-page"><RouterView /></div>
    </SScrollbar>
  </div>
  <Teleport to="body">
    <div ref="windowLayer" class="fixed inset-0 z-100 pointer-events-none" data-page-window-layer />
  </Teleport>
</template>

<style scoped>
/* Both the workspace and the teleported window layer own page layout styles. */
:deep(.admin-page-scroll) { flex: 1; min-height: 0; width: calc(100% + 9px); max-width: none; overflow: visible; }
:deep(.admin-page-scroll.is-outside) { grid-template-columns: minmax(0, 1fr) 9px; }
:deep(.admin-page-scroll > .s-scrollbar__wrap) { padding: 0; }
:deep(.admin-page) { width: 100%; padding-inline: 20px; padding-bottom: 64px; }
</style>
