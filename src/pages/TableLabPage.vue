<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import Mock from 'mockjs';
import { SCard, STable, SSelect, SButton, SAlert } from 'sax-design-vue';
import type { SaxGridSetting, TableExposes, TableHistoryState } from 'sax-design-vue';
import { t, locale } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
interface Row { id: number; nameZh: string; nameEn: string; quantity: number; status: 'pending' | 'active' | 'done'; note: string; owner: string }
const count = shallowRef(2000), rows = shallowRef<Row[]>([]), pending = shallowRef(false), table = shallowRef<TableExposes<Row>>();
const history = shallowRef<TableHistoryState>({ undoCount: 0, redoCount: 0, canUndo: false, canRedo: false });
function generate() { rows.value = Array.from({ length: count.value }, (_, i) => ({ id: i + 1, nameZh: `项目 ${i + 1}`, nameEn: `Project ${i + 1}`, quantity: Mock.Random.integer(1, 100), status: Mock.Random.pick(['pending', 'active', 'done']), note: Mock.Random.sentence(4, 10), owner: Mock.Random.cname() })); }
generate();
const setting = computed<SaxGridSetting<Row>>(() => ({
  rowKey: 'id', columns: [
    { field: 'id', title: 'ID', width: 80, fixed: 'left' },
    { field: locale.value === 'zh-CN' ? 'nameZh' : 'nameEn', title: t('tableLab.name'), minWidth: 240, editor: true, renderer: { name: '$input' } },
    { field: 'quantity', title: t('tableLab.quantity'), width: 150, editor: { type: 'number' } },
    { field: 'status', title: t('tableLab.status'), width: 180, editor: true, cell: ({ row }) => t(`tableLab.${row.status}`), renderer: { name: '$select', options: (['pending', 'active', 'done'] as const).map((value) => ({ value, label: t(`tableLab.${value}`) })) } },
    { field: 'note', title: t('tableLab.note'), minWidth: 300, editor: true, renderer: { name: '$textarea', props: { autosize: true } } },
    { field: 'owner', title: t('tableLab.owner'), width: 150, fixed: 'right', editor: true, renderer: { name: '$input' } },
  ], virtualConfig: { height: 480, dynamic: true, horizontal: true }, resizeConfig: true, rangeConfig: true, editConfig: { enabled: true, mode: 'cell', trigger: 'dblclick', onScroll: 'keep' }, historyConfig: true, changeConfig: true, findConfig: true,
  toolbarConfig: { title: t('nav.tableLab'), right: [{ itemRender: '$find' }, { itemRender: '$columnConfig' }] },
}));
</script>
<template><div class="feature-page">
  <PageHeading :title="t('nav.tableLab')" :caption="t('tableLab.caption')" eyebrow="TABLE"><div class="flex flex-wrap items-center gap-2.5"><SSelect v-model="count" :label="t('tableLab.count')" label-float :aria-label="t('tableLab.count')" :options="[100, 2000, 10000].map((value) => ({ value, label: value.toLocaleString() }))" /><SButton @click="generate">{{ t('tableLab.reset') }}</SButton></div></PageHeading>
  <SAlert color="primary" class="mb-5">{{ t('tableLab.tip') }}</SAlert>
  <SCard class="admin-card"><div class="flex flex-wrap items-center gap-2.5 mb-5"><SButton size="small" :disabled="!pending" @click="table?.commitEdit()">{{ t('tableLab.save') }}</SButton><SButton size="small" type="flat" :disabled="!pending" @click="table?.cancelEdit()">{{ t('tableLab.cancel') }}</SButton><SButton size="small" type="flat" :disabled="!history.canUndo" @click="table?.undo()">{{ t('tableLab.undo') }}</SButton><SButton size="small" type="flat" :disabled="!history.canRedo" @click="table?.redo()">{{ t('tableLab.redo') }}</SButton></div>
    <STable ref="table" v-model:data="rows" v-bind="setting" @edit-start="pending = true" @edit-commit="pending = false" @edit-cancel="pending = false" @history-change="history = $event" />
  </SCard>
</div></template>
