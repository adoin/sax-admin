<script setup lang="ts">
import { useRemainingHeight } from '@/composables/useRemainingHeight';
import type { ComponentPublicInstance } from 'vue';
import { computed, shallowRef } from 'vue';
import Mock from 'mockjs';
import { SCard, SVirtualList, SSplitter, SSplitterItem, SButton, SInputNumber, SInput, STag, SScrollbar } from 'sax-design-vue';
import type { VirtualListInstance, SplitterModelValue } from 'sax-design-vue';
import { t, locale } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
interface Item { id: number; title: string; description: string }
const workspaceCard = shallowRef<ComponentPublicInstance>();
const { style: workspaceStyle } = useRemainingHeight(workspaceCard, { minHeight: 360 });
const count = 100000, jump = shallowRef(50000), list = shallowRef<VirtualListInstance>(), selected = shallowRef<Item | null>(null), note = shallowRef('');
const range = shallowRef({ start: 0, end: 0 }), split = shallowRef<SplitterModelValue>({ type: 'horizontal', size: [.48, 'rest'] });
const text = Array.from({ length: 32 }, (_, i) => ({ zh: Mock.Random.cparagraph(1, i % 3 + 1), en: Mock.Random.paragraph(1, i % 3 + 1) }));
const readItem = computed(() => { const language = locale.value; return (index: number): Item => ({ id: index, title: t('virtual.record', { id: index + 1 }), description: text[index % text.length]![language === 'zh-CN' ? 'zh' : 'en'] }); });
function asItem(item: unknown) { return item as Item; }
function itemKeyAt(index: number) { return index; }
function updateRange(next: { start: number; end: number }) {
  if (range.value.start !== next.start || range.value.end !== next.end) range.value = next;
}
function toggle() { split.value = { ...split.value, type: split.value.type === 'horizontal' ? 'vertical' : 'horizontal' }; }
function jumpTo() { const index = Number(jump.value) - 1; if (Number.isFinite(index)) list.value?.scrollToIndex(Math.min(count - 1, Math.max(0, index)), 'center'); }
</script>
<template><div class="feature-page">
  <PageHeading :title="t('nav.virtual')" :caption="t('virtual.caption')" eyebrow="VIRTUAL"><SButton type="flat" @click="toggle">{{ t('virtual.layout') }}</SButton></PageHeading>
  <SCard ref="workspaceCard" class="admin-card remaining-height-card" :style="workspaceStyle"><div class="flex gap-3 items-center flex-wrap mb-5"><SInputNumber :model-value="jump" :value-on-clear="1" @update:model-value="jump = $event ?? 1" :min="1" :max="count" :aria-label="t('virtual.jump')" /><SButton @click="jumpTo">{{ t('virtual.jump') }}</SButton><STag>{{ t('virtual.range', { start: range.start + 1, end: range.end + 1, total: count }) }}</STag></div>
    <SSplitter v-model="split" class="virtual-workspace" style="flex: 1 1 0%; height: 0; min-height: 0" :gap="16"><SSplitterItem :min=".2"><SVirtualList ref="list" class="virtual-window" style="height: 100%; min-height: 0" :count="count" :item-at="readItem" :item-key-at="itemKeyAt" height="100%" :estimate-size="120" dynamic @range-change="updateRange"><template #default="{ item }"><div class="px-2 py-1.5"><SButton class="w-full" type="flat" :debounce="false" @click="selected = asItem(item)"><span class="block w-full text-left whitespace-normal"><b>{{ asItem(item).title }}</b><span class="block leading-7 mt-2">{{ asItem(item).description }}</span></span></SButton></div></template></SVirtualList></SSplitterItem>
      <SSplitterItem :min=".2"><SScrollbar height="100%"><SCard class="admin-card" :title="selected ? t('virtual.record', { id: selected.id + 1 }) : t('virtual.detail')"><p>{{ selected ? readItem(selected.id).description : t('virtual.noSelection') }}</p><SInput v-model="note" :placeholder="t('virtual.note')" :aria-label="t('virtual.note')" /></SCard></SScrollbar></SSplitterItem>
    </SSplitter>
  </SCard>
</div></template>
