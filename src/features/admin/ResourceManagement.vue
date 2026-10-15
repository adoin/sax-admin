<script setup lang="ts">
import { useRemainingHeight } from '@/composables/useRemainingHeight';
import type { ComponentPublicInstance } from 'vue';
import { computed, reactive, shallowRef } from 'vue';
import { STable, SCard, SButton, STag, SDialog, SAlert } from 'sax-design-vue';
import type { SaxGridSetting, TableExposes, TableRowKey } from 'sax-design-vue';
import type { AdminEntry, AdminInput, DepartmentEntry, ResourceKind } from '@/api/admin-contracts';
import { resourcesApi } from '@/api/admin';
import { sessionStore } from '@/stores/session';
import { t } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
import ResourceEditor from './ResourceEditor.vue';
import { departmentTree, entryName } from './entity-utils';
const tableCard = shallowRef<ComponentPublicInstance>();
const { style: tableCardStyle } = useRemainingHeight(tableCard);

const props = defineProps<{ kind: ResourceKind }>();
interface Filters { keyword: string; enabled: string }
const filters = reactive<Filters>({ keyword: '', enabled: '' }), session = sessionStore();
const table = shallowRef<TableExposes<AdminEntry, Filters>>(), editing = shallowRef<AdminEntry | null>(null), removing = shallowRef<AdminEntry | null>(null), departments = shallowRef<DepartmentEntry[]>([]);
const open = shallowRef(false), busy = shallowRef(false), error = shallowRef(''), notice = shallowRef<'business.saved' | 'business.deleted' | ''>('');
const expandedKeys = shallowRef<TableRowKey[]>([]);
const setting = computed<SaxGridSetting<AdminEntry, Filters>>(() => ({
  rowKey: 'id',
  columns: [
    { field: 'nameZh', title: t('business.name'), minWidth: 200, treeNode: props.kind === 'departments', slots: { default: 'name' } },
    { field: 'code', title: t('business.code'), minWidth: 130 },
    { field: 'description', title: t('business.details'), minWidth: 230, slots: { default: 'details' } },
    { field: 'enabled', title: t('business.state'), width: 100, slots: { default: 'state' } },
    { field: 'id', title: t('users.actions'), width: 165, slots: { default: 'actions' } },
  ],
  treeConfig: props.kind === 'departments' ? { children: 'children', expandAll: true, line: true } : undefined,
  queryConfig: { model: filters, items: [
    { field: 'keyword', span: 12, itemRender: { name: '$input', props: { clearable: true, label: t('business.search'), labelFloat: true } } },
    { field: 'enabled', span: 12, itemRender: { name: '$select', props: { label: t('business.state'), labelFloat: true }, options: [{ value: '', label: t('business.all') }, { value: 'active', label: t('business.active') }, { value: 'disabled', label: t('business.disabled') }] } },
  ] },
  toolbarConfig: { title: t(`nav.${props.kind}`), right: [{ itemRender: '$refresh' }, { itemRender: '$columnConfig' }] },
  pagerConfig: props.kind === 'departments' ? false : { remote: true, currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50] },
  proxyConfig: { autoLoad: true, autoQuery: true, query: async ({ form, pager, signal }) => {
    if (props.kind === 'departments') {
      const result = await resourcesApi.list('departments', { ...form, page: 1, pageSize: 2000 });
      expandedKeys.value = result.items.map((row) => row.id);
      return { data: departmentTree(result.items), total: result.total };
    }
    const method = resourcesApi.list(props.kind, { ...form, page: pager ? pager.currentPage || 1 : 1, pageSize: pager ? pager.pageSize || 10 : 10 });
    const abort = () => method.abort(); signal.addEventListener('abort', abort, { once: true });
    try { const result = await method; return { data: result.items, total: result.total }; }
    finally { signal.removeEventListener('abort', abort); }
  } },
}));
async function edit(row: AdminEntry | null) {
  error.value = '';
  try { if (props.kind === 'departments') departments.value = (await resourcesApi.list('departments', { keyword: '', enabled: '', page: 1, pageSize: 2000 })).items; editing.value = row; open.value = true; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : t('error.request'); }
}
async function save(input: AdminInput) {
  busy.value = true; error.value = '';
  try { await resourcesApi.save(input, editing.value?.id); open.value = false; notice.value = 'business.saved'; await table.value?.refresh(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : t('error.save'); }
  finally { busy.value = false; }
}
async function remove() {
  if (!removing.value) return; busy.value = true; error.value = '';
  try { await resourcesApi.remove(props.kind, removing.value.id); removing.value = null; notice.value = 'business.deleted'; await table.value?.refresh(); }
  catch (cause) { error.value = cause instanceof Error ? cause.message : t('error.delete'); }
  finally { busy.value = false; }
}
function details(row: AdminEntry) {
  if (row.kind === 'roles') return t('roles.count', { count: row.permissions.length });
  if (row.kind === 'departments') return `${row.manager} · ${row.email}`;
  return `${row.category} · ${row.value}`;
}
</script>
<template><div class="feature-page">
  <PageHeading :title="t(`nav.${kind}`)" :caption="t(`${kind}.caption`)" eyebrow="MANAGEMENT"><SButton :disabled="!session.isAdmin" @click="edit(null)">{{ t('business.new') }}</SButton></PageHeading>
  <SAlert v-if="notice" color="success" class="my-4">{{ t(notice) }}</SAlert><SAlert v-if="error && !open && !removing" color="danger" class="my-4">{{ error }}</SAlert>
  <SAlert v-if="kind === 'roles'" color="primary" class="my-4">{{ t('roles.note') }}</SAlert>
  <SCard ref="tableCard" class="admin-card remaining-table-card" :style="tableCardStyle"><STable :virtual-config="{ enabled: true, height: 'auto' }" ref="table" v-model:expanded-keys="expandedKeys" v-bind="setting">
    <template #name="{ row }">{{ entryName(row) }}</template><template #details="{ row }">{{ details(row) }}</template>
    <template #state="{ row }"><STag :color="row.enabled ? 'success' : 'warn'">{{ t(row.enabled ? 'business.active' : 'business.disabled') }}</STag></template>
    <template #actions="{ row }"><div class="table-row-actions"><SButton size="small" type="flat" :disabled="!session.isAdmin" @click="edit(row)">{{ t('business.actionEdit') }}</SButton><SButton size="small" type="flat" color="danger" :disabled="!session.isAdmin" @click="removing = row; error = ''">{{ t('business.actionDelete') }}</SButton></div></template>
  </STable></SCard>
  <ResourceEditor v-model:open="open" :kind="kind" :entry="editing" :departments="departments" :busy="busy" :error="error" @save="save" />
  <SDialog :model-value="Boolean(removing)" :title="t('business.remove')" width="440px" @update:model-value="(value) => { if (!value) removing = null; }"><p>{{ t('business.confirmRemove', { name: removing ? entryName(removing) : '' }) }}</p><SAlert v-if="error" color="danger">{{ error }}</SAlert><template #footer><div class="flex flex-wrap gap-2"><SButton type="flat" @click="removing = null">{{ t('common.cancel') }}</SButton><SButton color="danger" :loading="busy" @click="remove">{{ t('business.remove') }}</SButton></div></template></SDialog>
</div></template>
