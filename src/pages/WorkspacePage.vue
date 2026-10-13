<script setup lang="ts">
import { useRouter } from "vue-smart-router";
import { SCard, SButton, STag } from "sax-design-vue";
import PageHeading from "@/components/common/PageHeading.vue";
import { workspaceStore } from "@/stores/workspace";
import { registerDraftRoute, removeDraftRoute } from "@/router/workspace";
import { t } from "@/i18n";
const router = useRouter(), workspace = workspaceStore();
function enable() { registerDraftRoute(router); workspace.editorEnabled = true; }
function open(id: number) { router.push(`/drafts/${id}`); }
function create() { open(workspace.nextDraft++); }
</script>
<template>
  <PageHeading :title="t('nav.workspace')" :caption="t('workspace.caption')" eyebrow="WORKSPACE" />
  <SCard class="admin-card" :title="t('workspace.route')" :subtitle="t('workspace.routeCaption')">
    <STag :color="workspace.editorEnabled ? 'success' : 'warn'">{{ t(workspace.editorEnabled ? 'workspace.enabled' : 'workspace.disabled') }}</STag>
    <div class="workspace-controls">
      <SButton v-if="!workspace.editorEnabled" @click="enable">{{ t('workspace.enable') }}</SButton>
      <SButton v-else color="danger" type="flat" @click="removeDraftRoute(router)">{{ t('workspace.disable') }}</SButton>
    </div>
  </SCard>
  <div class="workspace-example">
    <SCard class="admin-card" :title="t('workspace.instances')" :subtitle="t('workspace.instancesCaption')">
      <div class="workspace-controls">
        <SButton v-for="id in [1, 2]" :key="id" :disabled="!workspace.editorEnabled" @click="open(id)">{{ t('workspace.open', { id }) }}</SButton>
        <SButton type="flat" :disabled="!workspace.editorEnabled" @click="create">{{ t('workspace.new') }}</SButton>
      </div>
    </SCard>
  </div>
</template>
<style scoped>
.workspace-controls { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
.workspace-example { margin-top: 20px; }
</style>
