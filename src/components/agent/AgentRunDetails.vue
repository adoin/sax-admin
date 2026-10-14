<script setup lang="ts">
import { shallowRef } from "vue";
import {
  SReasoningSteps,
  SPlanCard,
  STaskList,
  SInlineCitations,
} from "sax-design-vue";
import type { AgentTask, AgentSource } from "sax-design-vue";
import { t } from "@/i18n";
const reasoningExpanded = shallowRef(false);
const planExpanded = shallowRef(false);
const tasksExpanded = shallowRef(true);
defineProps<{
  tasks: AgentTask[];
  sources: AgentSource[];
  reasoning: string[];
  status: "pending" | "approved" | "rejected" | null;
  content: string;
}>();
defineEmits<{ approve: []; reject: [] }>();
</script>
<template>
  <aside class="agent-details flex flex-col gap-6 min-w-0">
    <p v-if="!tasks.length" class="text-sm text-muted leading-7 m-0">
      {{ t("agent.planHint") }}
    </p>
    <SReasoningSteps
      v-model:expanded="reasoningExpanded"
      v-if="tasks.length"
      :title="t('agent.reasoningTitle')"
      :steps="tasks"
      :reasoning="reasoning"
    />
    <SPlanCard
      v-model:expanded="planExpanded"
      v-if="status === 'pending' || status === 'rejected'"
      :title="t('agent.planTitle')"
      :description="t('agent.planDescription')"
      :tasks="tasks"
      :status="status"
      :content="content"
      @approve="$emit('approve')"
      @reject="$emit('reject')"
    />
    <STaskList
      v-model:expanded="tasksExpanded"
      v-else-if="tasks.length"
      :title="t('agent.tasksTitle')"
      :tasks="tasks"
    />
    <div class="flex flex-col gap-3">
      <p class="text-xs text-muted m-0 leading-6">
        {{ t("agent.sourcesNote") }}
      </p>
      <SInlineCitations :sources="sources" :label="t('agent.sourcesTitle')" />
    </div>
  </aside>
</template>
