<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from "vue";
import {
  SCard,
  SMessageScroller,
  SMessage,
  SCodeBlock,
  SInlineCitations,
  SChatInput,
  SButton,
  SAlert,
} from "sax-design-vue";
import type {
  AgentHistoryMessage,
  AgentAttachment,
  MessageScrollerAction,
  AgentTask,
  AgentSource,
  ChatInputModel,
} from "sax-design-vue";
import { assistantApi } from "@/api/admin";
import { t, locale } from "@/i18n";
import PageHeading from "@/components/common/PageHeading.vue";
import AgentRunDetails from "@/components/agent/AgentRunDetails.vue";
import agentSource from "./AgentPage.vue?raw";
const selectedModel = shallowRef("chat"),
  fast = shallowRef(false),
  reasoningLevel = shallowRef("standard");
const models = computed<ChatInputModel[]>(() => [
  // 2.1.3 still reads this compatibility flag when displaying the Fast button.
  {
    value: "chat",
    label: t("agent.chatModel"),
    supportsFast: true,
    capabilities: { fast: true },
  },
  {
    value: "planner",
    label: t("agent.planModel"),
    supportsFast: true,
    capabilities: {
      fast: true,
      reasoning: {
        default: "standard",
        options: [
          { value: "standard", label: t("agent.standard") },
          { value: "detailed", label: t("agent.detailed") },
        ],
      },
    },
  },
]);
const tasks = shallowRef<AgentTask[]>([]),
  planStatus = shallowRef<"pending" | "approved" | "rejected" | null>(null);
interface RunDetails {
  tasks: AgentTask[];
  reasoning: string[];
  status: "pending" | "approved" | "rejected" | null;
  content: string;
}
const detailReplyId = shallowRef<string>();
const previousRuns = shallowRef<Record<string, RunDetails>>({});
function getRun(id: string): RunDetails | undefined {
  return id === detailReplyId.value
    ? { tasks: tasks.value, reasoning: reasoning.value, status: planStatus.value, content: planContent.value }
    : previousRuns.value[id];
}
function archiveRun() {
  const id = detailReplyId.value;
  if (id) previousRuns.value = { ...previousRuns.value, [id]: { ...getRun(id)!, tasks: tasks.value.map(task => ({ ...task })) } };
}
const pendingPlan = shallowRef<{ text: string; id: string } | null>(null);
const reasoning = computed(() => [
  t("agent.reasoningMock"),
  t(
    reasoningLevel.value === "detailed" && selectedModel.value === "planner"
      ? "agent.reasoningDetailed"
      : "agent.reasoningStandard",
  ),
]);
const sources = computed<AgentSource[]>(() => [
  {
    id: "chat-input",
    title: "SChatInput",
    publisher: "Sax Design Vue",
    href: `https://sax-design.emssion.com/${locale.value === "zh-CN" ? "zh/" : ""}components/chat-input.html`,
    description: t("agent.inputSource"),
  },
  {
    id: "plan-card",
    title: "SPlanCard",
    publisher: "Sax Design Vue",
    href: `https://sax-design.emssion.com/${locale.value === "zh-CN" ? "zh/" : ""}components/plan-card.html`,
    description: t("agent.planSource"),
  },
]);
const planContent = computed(() =>
  [
    pendingPlan.value?.text || "",
    ...tasks.value.map((task, index) => `${index + 1}. ${task.title}`),
  ].join("\n"),
);
function prepareTasks() {
  tasks.value = (
    ["agent.taskUnderstand", "agent.taskDraft", "agent.taskReview"] as const
  ).map((key, index) => ({
    id: `task-${index}`,
    title: t(key),
    status: "pending",
  }));
}
function advanceTasks(progress: number) {
  tasks.value = tasks.value.map((task, index) => {
    const local = Math.max(
      0,
      Math.min(1, progress * tasks.value.length - index),
    );
    return {
      ...task,
      status: local === 1 ? "complete" : local > 0 ? "running" : "pending",
      progress: Math.round(local * 100),
    };
  });
}
function approvePlan() {
  const pending = pendingPlan.value;
  if (!pending || planStatus.value !== "pending") return;
  pendingPlan.value = null;
  planStatus.value = "approved";
  generate(pending.text, pending.id);
}
function rejectPlan() {
  const pending = pendingPlan.value;
  if (!pending) return;
  pendingPlan.value = null;
  planStatus.value = "rejected";
  tasks.value = tasks.value.map((task) => ({ ...task, status: "cancelled" }));
  messages.value = messages.value.map((row) =>
    row.id === pending.id ? { ...row, content: t("agent.planRejected") } : row,
  );
}
const prompt = shallowRef(""),
  running = shallowRef(false),
  messages = shallowRef<AgentHistoryMessage[]>([
    { id: "greeting", role: "assistant", content: t("agent.greeting") },
  ]);
const attachments = shallowRef<AgentAttachment[]>([]),
  editingId = shallowRef<string | null>(null),
  notice = shallowRef<
    "agent.feedback" | "agent.copyError" | "files.errorPick" | ""
  >("");
let sequence = 0,
  revision = 0,
  timer: ReturnType<typeof setInterval> | undefined,
  method: ReturnType<typeof assistantApi.reply> | undefined,
  activeReplyId: string | undefined;
function stop() {
  revision++;
  if (timer) clearInterval(timer);
  timer = undefined;
  method?.abort();
  method = undefined;
  activeReplyId = undefined;
  running.value = false;
  tasks.value = tasks.value.map((task) =>
    task.status === "running" || task.status === "pending"
      ? { ...task, status: "cancelled" }
      : task,
  );
}
function clear() {
  stop();
  tasks.value = [];
  detailReplyId.value = undefined;
  previousRuns.value = {};
  pendingPlan.value = null;
  planStatus.value = null;
  prompt.value = "";
  attachments.value = [];
  editingId.value = null;
  notice.value = "";
  messages.value = [
    { id: "greeting", role: "assistant", content: t("agent.greeting") },
  ];
}
async function generate(text: string, id: string) {
  const request = ++revision;
  running.value = true;
  activeReplyId = id;
  advanceTasks(0.1);
  try {
    method = assistantApi.reply(text);
    const reply = await method;
    if (request !== revision) return;
    method = undefined;
    let position = 0;
    timer = setInterval(
      () => {
        if (request !== revision) return;
        position = Math.min(reply.content.length, position + 8);
        messages.value = messages.value.map((row) =>
          row.id === id
            ? { ...row, content: reply.content.slice(0, position) }
            : row,
        );
        advanceTasks(
          0.34 + (0.66 * position) / Math.max(1, reply.content.length),
        );
        if (position === reply.content.length) {
          if (timer) clearInterval(timer);
          timer = undefined;
          activeReplyId = undefined;
          running.value = false;
        }
      },
      fast.value
        ? 12
        : reasoningLevel.value === "detailed" &&
            selectedModel.value === "planner"
          ? 65
          : 35,
    );
  } catch (cause) {
    if (request !== revision) return;
    messages.value = messages.value.map((row) =>
      row.id === id
        ? {
            ...row,
            content:
              cause instanceof Error ? cause.message : t("error.request"),
          }
        : row,
    );
    tasks.value = tasks.value.map((task) =>
      task.status === "complete" ? task : { ...task, status: "error" },
    );
    activeReplyId = undefined;
    running.value = false;
  }
}
async function send(text: string, files: AgentAttachment[] = []) {
  if (running.value || pendingPlan.value || (!text.trim() && !files.length))
    return;
  const question = [
    text.trim() || t("agent.filesOnly"),
    ...files.map((file) => file.name),
  ].join("\n");
  const id = `reply-${++sequence}`;
  if (editingId.value) {
    const index = messages.value.findIndex((row) => row.id === editingId.value);
    messages.value = [
      ...messages.value.slice(0, index),
      { id: editingId.value, role: "user", content: question },
      { id, role: "assistant", content: "" },
    ];
  } else
    messages.value = [
      ...messages.value,
      { id: `user-${sequence}`, role: "user", content: question },
      { id, role: "assistant", content: "" },
    ];
  prompt.value = "";
  attachments.value = [];
  editingId.value = null;
  notice.value = "";
  archiveRun();
  detailReplyId.value = id;
  prepareTasks();
  if (selectedModel.value === "planner") {
    pendingPlan.value = { text: question, id };
    planStatus.value = "pending";
    messages.value = messages.value.map((row) =>
      row.id === id ? { ...row, content: t("agent.planWaiting") } : row,
    );
    return;
  }
  planStatus.value = null;
  await generate(question, id);
}
function messageAction(event: MessageScrollerAction) {
  if (event.action === "feedback") {
    notice.value = "agent.feedback";
    return;
  }
  if (event.action === "copy-error") {
    notice.value = "agent.copyError";
    return;
  }
  if (event.action === "edit") {
    if (pendingPlan.value) rejectPlan();
    stop();
    editingId.value = event.item.id;
    prompt.value = event.item.content;
    return;
  }
  if (event.action === "regenerate") {
    if (pendingPlan.value) return;
    stop();
    const question =
      messages.value
        .slice(0, event.index)
        .reverse()
        .find((row) => row.role === "user")?.content || t("agent.defaultTask");
    archiveRun();
    detailReplyId.value = event.item.id;
    prepareTasks();
    planStatus.value = null;
    messages.value = messages.value.map((row) =>
      row.id === event.item.id ? { ...row, content: "" } : row,
    );
    generate(question, event.item.id);
  }
}
function cancel() {
  const id = activeReplyId;
  stop();
  messages.value = messages.value.map((row) =>
    row.id === id && !row.content ? { ...row, content: t("agent.stop") } : row,
  );
}
onBeforeUnmount(stop);
</script>
<template>
  <div class="feature-page">
    <PageHeading
      :title="t('nav.agent')"
      :caption="t('agent.caption')"
      eyebrow="AGENT"
      ><SButton type="flat" @click="clear">{{
        t("agent.clear")
      }}</SButton></PageHeading
    >
    <p class="text-xs text-muted mb-5 leading-6">{{ t("agent.note") }}</p>
    <SAlert
      v-if="notice"
      :color="notice === 'agent.feedback' ? 'success' : 'warn'"
      class="mb-5"
      >{{ t(notice) }}</SAlert
    >
    <div
      class="agent-shell"
    >
      <SCard class="admin-card agent-workspace">
        <SMessageScroller
          :items="messages"
          :height="420"
          :has-more="false"
          :label="t('agent.history')"
          @message-action="messageAction"
        >
          <template #message="{ item, index }">
            <SMessage :role="item.role" :content="item.content"
              @edit="messageAction({ item, index, action: 'edit' })"
              @regenerate="messageAction({ item, index, action: 'regenerate' })"
              @update:feedback="messageAction({ item, index, action: 'feedback', feedback: $event })"
              @copy-error="messageAction({ item, index, action: 'copy-error', error: $event })" />
            <AgentRunDetails v-if="getRun(item.id)" class="agent-message-details"
              v-bind="getRun(item.id)!"
              @approve="approvePlan" @reject="rejectPlan" />
          </template>
        </SMessageScroller>
        <SChatInput
          v-model="prompt"
          v-model:attachments="attachments"
          v-model:model="selectedModel"
          v-model:fast="fast"
          v-model:reasoning="reasoningLevel"
          :models="models"
          :disabled="!!pendingPlan"
          :loading="running"
          :voice-input="false"
          accept="image/*,.pdf"
          :file-limit-size="5"
          :placeholder="t('agent.placeholder')"
          :label="t('agent.placeholder')"
          @submit="send"
          @stop="cancel"
          @file-error="notice = 'files.errorPick'"
        />
        <div v-if="messages.length === 1" class="flex flex-wrap gap-3">
          <SButton
            type="flat"
            size="small"
            @click="
              selectedModel = 'planner';
              prompt = t('agent.planPrompt');
            "
            >{{ t("agent.tryPlan") }}</SButton
          >
          <SButton
            type="flat"
            size="small"
            @click="
              selectedModel = 'chat';
              fast = true;
              prompt = t('agent.chatPrompt');
            "
            >{{ t("agent.tryChat") }}</SButton
          >
        </div>
        <p class="text-xs text-muted m-0 leading-6">
          {{ t("agent.attachmentNote") }}
        </p>
      </SCard>
    </div>
    <SCard class="admin-card mt-5" :title="t('agent.sourcesTitle')">
      <p class="text-xs text-muted leading-6">{{ t('agent.sourcesNote') }}</p>
      <SInlineCitations :sources="sources" :label="t('agent.sourcesTitle')" />
      <div class="mt-4"><SCodeBlock :code="agentSource" language="vue" filename="AgentPage.vue" :expanded="false" :download="false" /></div>
    </SCard>
  </div>
</template>
<style scoped>
.agent-shell {
  max-width: 1080px;
  margin-inline: auto;
}
.agent-message-details {
  margin: 4px 0 20px 36px;
  max-width: 720px;
}
.agent-shell :deep(.agent-workspace.s-card) {
  border: 0;
  box-shadow: none;
  background: transparent;
}
.agent-shell :deep(.s-card__body) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}
.agent-shell :deep(.s-message-scroller) {
  box-shadow: none;
  background: transparent;
}
.agent-shell :deep(.s-agent-viewport) {
  padding: 8px 4px;
}
.agent-shell :deep(.s-chat-input) {
  padding: 10px;
  background: color-mix(in srgb, currentColor 4%, transparent);
  box-shadow: inset 0 2px 8px -5px
    color-mix(in srgb, currentColor 18%, transparent);
}
.agent-shell :deep(.agent-details .s-agent-surface) {
  box-shadow: none;
  background: transparent;
  padding: 0;
}
</style>
