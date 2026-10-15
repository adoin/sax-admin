<script setup lang="ts">
import { shallowRef } from "vue";
import {
  SReasoningSteps,
  SPlanCard,
  STaskList,
} from "sax-design-vue";
import type { AgentTask } from "sax-design-vue";
import { t } from "@/i18n";
const reasoningExpanded = shallowRef(false);
const planExpanded = shallowRef(true);
const tasksExpanded = shallowRef(true);
defineProps<{
  tasks: AgentTask[];
  reasoning: string[];
  status: "pending" | "approved" | "rejected" | null;
  content: string;
}>();
defineEmits<{ approve: []; reject: [] }>();
</script>
<template>
  <section class="agent-details flex flex-col gap-4 min-w-0">
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
      v-if="tasks.length && status !== 'pending' && status !== 'rejected'"
      :title="t('agent.tasksTitle')"
      :tasks="tasks"
    />
  </section>
</template>
