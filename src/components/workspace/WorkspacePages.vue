<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-smart-router";
import { SScrollbar } from "sax-design-vue";
import { workspaceStore } from "@/stores/workspace";
import WorkspacePageHost from "./WorkspacePageHost.vue";
const workspace = workspaceStore();
const route = useRoute();
const tabless = computed(() => !!route.meta.tabless);
</script>

<template>
  <div class="relative flex-1 min-h-0 isolate" data-page-workspace>
    <WorkspacePageHost
      v-for="tab in workspace.tabs"
      :key="`${tab.fullPath}::${tab.revision}`"
      :tab="tab"
    />
    <SScrollbar
      v-if="tabless"
      class="admin-page-scroll"
      wrap-class="s-layout-body"
      height="100%"
      placement="outside"
      :gap="3"
      :always="false"
    >
      <div class="py-7 md:py-8 admin-page"><RouterView /></div>
    </SScrollbar>
  </div>
</template>
