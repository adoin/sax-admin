<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue';
import { SCard, SMessageScroller, SChatInput, SButton, SAlert } from 'sax-design-vue';
import type { AgentHistoryMessage, AgentAttachment, MessageScrollerAction } from 'sax-design-vue';
import { assistantApi } from '@/api/admin';
import { t } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
const prompt = shallowRef(''), running = shallowRef(false), messages = shallowRef<AgentHistoryMessage[]>([{ id: 'greeting', role: 'assistant', content: t('agent.greeting') }]);
const attachments = shallowRef<AgentAttachment[]>([]), editingId = shallowRef<string | null>(null), notice = shallowRef<'agent.feedback' | 'agent.copyError' | 'files.errorPick' | ''>('');
let sequence = 0, revision = 0, timer: ReturnType<typeof setInterval> | undefined, method: ReturnType<typeof assistantApi.reply> | undefined, activeReplyId: string | undefined;
function stop() { revision++; if (timer) clearInterval(timer); timer = undefined; method?.abort(); method = undefined; activeReplyId = undefined; running.value = false; }
function clear() { stop(); prompt.value = ''; attachments.value = []; editingId.value = null; notice.value = ''; messages.value = [{ id: 'greeting', role: 'assistant', content: t('agent.greeting') }]; }
async function generate(text: string, id: string) {
  const request = ++revision; running.value = true; activeReplyId = id;
  try {
    method = assistantApi.reply(text); const reply = await method;
    if (request !== revision) return;
    method = undefined;
    let position = 0;
    timer = setInterval(() => {
      if (request !== revision) return;
      position = Math.min(reply.content.length, position + 8);
      messages.value = messages.value.map((row) => row.id === id ? { ...row, content: reply.content.slice(0, position) } : row);
      if (position === reply.content.length) { if (timer) clearInterval(timer); timer = undefined; activeReplyId = undefined; running.value = false; }
    }, 35);
  } catch (cause) {
    if (request !== revision) return;
    messages.value = messages.value.map((row) => row.id === id ? { ...row, content: cause instanceof Error ? cause.message : t('error.request') } : row); activeReplyId = undefined; running.value = false;
  }
}
async function send(text: string, files: AgentAttachment[] = []) {
  if (running.value || (!text.trim() && !files.length)) return;
  const question = [text.trim() || t('agent.filesOnly'), ...files.map((file) => file.name)].join('\n');
  const id = `reply-${++sequence}`;
  if (editingId.value) {
    const index = messages.value.findIndex((row) => row.id === editingId.value);
    messages.value = [...messages.value.slice(0, index), { id: editingId.value, role: 'user', content: question }, { id, role: 'assistant', content: '' }];
  } else messages.value = [...messages.value, { id: `user-${sequence}`, role: 'user', content: question }, { id, role: 'assistant', content: '' }];
  prompt.value = ''; attachments.value = []; editingId.value = null; notice.value = ''; await generate(question, id);
}
function messageAction(event: MessageScrollerAction) {
  if (event.action === 'feedback') { notice.value = 'agent.feedback'; return; }
  if (event.action === 'copy-error') { notice.value = 'agent.copyError'; return; }
  if (event.action === 'edit') { stop(); editingId.value = event.item.id; prompt.value = event.item.content; return; }
  if (event.action === 'regenerate') {
    stop(); const question = messages.value.slice(0, event.index).reverse().find((row) => row.role === 'user')?.content || t('agent.defaultTask');
    messages.value = messages.value.map((row) => row.id === event.item.id ? { ...row, content: '' } : row); generate(question, event.item.id);
  }
}
function cancel() { const id = activeReplyId; stop(); messages.value = messages.value.map((row) => row.id === id && !row.content ? { ...row, content: t('agent.stop') } : row); }
onBeforeUnmount(stop);
</script>
<template><div class="feature-page">
  <PageHeading :title="t('nav.agent')" :caption="t('agent.caption')" eyebrow="AGENT"><SButton type="flat" @click="clear">{{ t('agent.clear') }}</SButton></PageHeading>
  <SAlert color="primary" class="mb-5">{{ t('agent.note') }}</SAlert>
  <SAlert v-if="notice" :color="notice === 'agent.feedback' ? 'success' : 'warn'" class="mb-5">{{ t(notice) }}</SAlert>
  <SCard class="admin-card"><SMessageScroller :items="messages" :height="420" :has-more="false" :label="t('agent.history')" @message-action="messageAction" /><SChatInput v-model="prompt" v-model:attachments="attachments" :loading="running" :voice-input="false" accept="image/*,.pdf" :file-limit-size="5" :placeholder="t('agent.placeholder')" :label="t('agent.placeholder')" @submit="send" @stop="cancel" @file-error="notice = 'files.errorPick'" /><p class="text-xs text-muted mt-4">{{ t('agent.attachmentNote') }}</p></SCard>
</div></template>
