<script setup lang="ts">
import { computed, reactive, shallowRef } from "vue";
import { SCard, SForm, SButton, SAlert } from "sax-design-vue";
import type { FormItemConfig } from "sax-design-vue";
import PageHeading from "@/components/common/PageHeading.vue";
import { t } from "@/i18n";
const props = defineProps<{ id: string }>();
interface Draft { title: string; content: string }
const model = reactive<Draft>({ title: `#${props.id}`, content: "" });
const saved = shallowRef(false);
const items = computed<FormItemConfig<Draft>[]>(() => [
  { field: "title", title: t('workspace.title'), span: 24, itemRender: { name: "$input" } },
  { field: "content", title: t('workspace.content'), span: 24, itemRender: { name: "$textarea", props: { rows: 8 } } },
]);
</script>
<template>
  <PageHeading :title="t('workspace.draft', { id })" :caption="t('workspace.editorCaption')" eyebrow="DRAFT" />
  <SCard class="admin-card">
    <SForm :model="model" :items="items" label-position="top" @change="saved = false" />
    <SAlert v-if="saved" color="success">{{ t('workspace.saved') }}</SAlert>
    <template #footer><SButton @click="saved = true">{{ t('workspace.save') }}</SButton></template>
  </SCard>
</template>
