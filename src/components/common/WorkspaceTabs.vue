<script setup lang="ts">
import { STabs, STab, SButton } from "sax-design-vue";
import { RefreshCw } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-smart-router";
import { workspaceStore } from "@/stores/workspace";
import { t } from "@/i18n";
const workspace = workspaceStore(), route = useRoute(), router = useRouter();
async function close(value: string | number) {
  const path = String(value);
  const index = workspace.tabs.findIndex((tab) => tab.fullPath === path);
  if (index < 0 || workspace.tabs[index]!.pinned) return;
  if (route.fullPath === path) {
    const next = workspace.tabs[index - 1] || workspace.tabs[index + 1];
    const failure = await router.push(next?.fullPath || "/dashboard");
    if (failure) return;
  }
  workspace.remove(path);
}
async function closeAll() {
  const failure = await router.push("/dashboard");
  if (!failure) workspace.retain([]);
}
</script>
<template>
  <div class="workspace-bar">
    <STabs class="workspace-tabs" :model-value="route.fullPath" type="editable-card" overflow="scroll" hide-add :animated="false" :aria-label="t('workspace.tabs')" @update:model-value="(path) => router.push(String(path))" @remove="close">
      <STab v-for="tab in workspace.tabs" :key="tab.fullPath" :name="tab.fullPath" :label="t(tab.title, tab.titleId ? { id: tab.titleId } : {})" :closable="!tab.pinned" />
    </STabs>
    <div class="workspace-actions">
      <SButton icon type="transparent" :debounce="false" :aria-label="t('workspace.refresh')" @click="workspace.refresh(route.fullPath)"><RefreshCw :size="16" /></SButton>
      <SButton size="small" type="flat" :debounce="false" @click="workspace.retain([route.fullPath])">{{ t('workspace.closeOthers') }}</SButton>
      <SButton size="small" type="flat" :debounce="false" @click="closeAll">{{ t('workspace.closeAll') }}</SButton>
    </div>
  </div>
</template>
<style scoped>
.workspace-bar { display: flex; align-items: center; gap: 12px; padding: 12px 20px 0; width: 100%; }
.workspace-tabs { flex: 1; min-width: 0; }
.workspace-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.workspace-tabs :deep(.s-tabs__content) { display: none; }
@media (max-width: 760px) { .workspace-bar { flex-wrap: wrap; } .workspace-tabs { flex-basis: 100%; } .workspace-actions { margin-left: auto; } }
</style>
