<script setup lang="ts">
import { useRouter } from "vue-smart-router";
import { SCard, SButton, STag, SAlert, SCodeBlock } from "sax-design-vue";
import PageHeading from "@/components/common/PageHeading.vue";
import { workspaceStore } from "@/stores/workspace";
import { registerDraftRoute, removeDraftRoute } from "@/router/workspace";
import { t } from "@/i18n";
import routeSource from "@/router/workspace.ts?raw";
import editorSource from "./DraftPage.vue?raw";
const router = useRouter(), workspace = workspaceStore();
function enable() { registerDraftRoute(router); workspace.editorEnabled = true; }
function open(id: number) { if (!workspace.editorEnabled) enable(); router.push(`/drafts/${id}`); }
function create() { open(workspace.nextDraft++); }
</script>
<template>
  <PageHeading :title="t('nav.workspace')" :caption="t('workspace.caption')" eyebrow="WORKSPACE" />
  <div class="grid gap-5">
    <SCard class="admin-card" :title="t('workspace.instances')" :subtitle="t('workspace.instancesCaption')">
      <ol class="grid gap-3 pl-5 leading-7"><li>{{ t('workspace.stepOne') }}</li><li>{{ t('workspace.stepTwo') }}</li><li>{{ t('workspace.stepThree') }}</li></ol>
      <div class="flex flex-wrap gap-3 my-5">
        <SButton v-for="id in [1, 2]" :key="id" @click="open(id)">{{ t('workspace.open', { id }) }}</SButton>
        <SButton type="flat" @click="create">{{ t('workspace.new') }}</SButton>
      </div>
      <SAlert color="primary">{{ t('workspace.boundary') }}</SAlert>
    </SCard>
    <SCard class="admin-card" :title="t('workspace.implementation')" :subtitle="t('workspace.implementationCaption')">
      <p class="text-sm text-muted leading-7">{{ t('workspace.routeCaption') }}</p>
      <div class="flex flex-wrap items-center gap-3 my-5">
        <STag :color="workspace.editorEnabled ? 'success' : 'warn'">{{ t(workspace.editorEnabled ? 'workspace.enabled' : 'workspace.disabled') }}</STag>
        <SButton v-if="!workspace.editorEnabled" type="flat" @click="enable">{{ t('workspace.enable') }}</SButton>
        <SButton v-else color="danger" type="flat" @click="removeDraftRoute(router)">{{ t('workspace.disable') }}</SButton>
      </div>
      <div class="grid gap-4"><SCodeBlock :code="routeSource" filename="src/router/workspace.ts" language="typescript" :expanded="false" :download="false" /><SCodeBlock :code="editorSource" filename="src/pages/DraftPage.vue" language="vue" :expanded="false" :download="false" /></div>
    </SCard>
  </div>
</template>
