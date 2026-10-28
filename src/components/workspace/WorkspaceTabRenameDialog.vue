<script setup lang="ts">
import { shallowRef, watch } from "vue";
import { SDialog, SInput } from "sax-design-vue";
import type { InputInstance } from "sax-design-vue";
import { t } from "@/i18n";

const props = defineProps<{ open: boolean; title: string }>();
const emit = defineEmits<{
  "update:open": [value: boolean];
  rename: [value: string];
}>();
const draft = shallowRef("");
const input = shallowRef<InputInstance>();
watch(
  () => props.open,
  (open) => {
    if (open) draft.value = props.title;
  },
  { immediate: true },
);
function focusInput() {
  input.value?.focus();
  input.value?.select();
}
function save() {
  const value = draft.value.trim();
  if (!props.open || !value) return;
  emit("rename", value);
  emit("update:open", false);
}
function enter(event: KeyboardEvent | Event) {
  if (!(event instanceof KeyboardEvent) || event.isComposing) return;
  event.preventDefault();
  save();
}
</script>

<template>
  <SDialog
    :model-value="open"
    :title="t('workspace.renameTab')"
    width="400px"
    lock-scroll
    show-footer
    show-cancel-button
    show-confirm-button
    :confirm-disabled="!draft.trim()"
    :confirm-closable="false"
    :confirm-button-text="t('common.save')"
    :cancel-button-text="t('common.cancel')"
    @confirm="save"
    @update:model-value="emit('update:open', $event)"
    @opened="focusInput"
  >
    <SInput
      ref="input"
      v-model="draft"
      :label="t('workspace.tabName')"
      block
      @keydown.enter="enter"
    />
  </SDialog>
</template>
