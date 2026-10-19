<script setup lang="ts">
import { computed, reactive } from "vue";
import { SCard, SForm, SButton, SAlert, STag } from "sax-design-vue";
import { useRoute, useRouter } from "vue-smart-router";
import type { FormItemConfig } from "sax-design-vue";
import PageHeading from "@/components/common/PageHeading.vue";
import { t } from "@/i18n";
const props = defineProps<{ id: string }>();
const router = useRouter();
const route = useRoute();
const channel = computed(() => route.query.channel === 'sales' ? t('workspace.salesChannel') : route.query.channel === 'support' ? t('workspace.supportChannel') : undefined);
interface Draft { title: string; content: string }
const model = reactive<Draft>({ title: `#${props.id}`, content: "" });
const items = computed<FormItemConfig<Draft>[]>(() => [
  { field: "title", title: t('workspace.title'), span: 24, itemRender: { name: "$input" } },
  { field: "content", title: t('workspace.content'), span: 24, itemRender: { name: "$textarea", props: { rows: 8 } } },
]);
</script>
<template>
  <PageHeading :title="t('workspace.draft', { id })" :caption="t('workspace.editorCaption')" eyebrow="DRAFT" />
  <SCard class="admin-card">
    <STag v-if="channel" class="mb-4">{{ channel }}</STag>
    <SAlert color="primary" class="mb-5">{{ t('workspace.draftNotice') }}</SAlert>
    <SForm :model="model" :items="items" label-position="top" />
    <template #footer><SButton type="flat" @click="router.push('/workspace')">{{ t('workspace.back') }}</SButton></template>
  </SCard>
</template>
