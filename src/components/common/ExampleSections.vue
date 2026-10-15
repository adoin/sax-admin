<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { SAnchor } from 'sax-design-vue';
import { t } from '@/i18n';
import type { MessageKey } from '@/i18n/messages';
const props = defineProps<{ sections: { id: string; title: MessageKey }[] }>();
const root = shallowRef<HTMLElement>();
const items = computed(() => props.sections.map(section => ({ href: `#${section.id}`, title: t(section.title) })));
const getContainer = () => root.value?.closest<HTMLElement>('.admin-page-scroll > .s-scrollbar__wrap') ?? window;
</script>
<template>
  <div ref="root" class="example-sections">
    <SAnchor :items="items" direction="horizontal" :get-container="getContainer" :target-offset="96" :active-offset="104" replace />
  </div>
</template>
<style scoped>
.example-sections { position: sticky; top: 0; z-index: 12; margin-bottom: 20px; padding: 10px 12px; border-radius: var(--sax-radius-md); background: var(--sax-css-background); box-shadow: 0 4px 14px -10px rgb(25 45 90 / 25%); }
</style>
