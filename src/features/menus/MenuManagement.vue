<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { SCard, STable, SButton, SAlert, STag, SDialog, SIcon } from 'sax-design-vue';
import type { SaxGridSetting } from 'sax-design-vue';
import type { AdminMenu, MenuInput } from '@/api/menu-contracts';
import { menusApi } from '@/api/menus';
import { menusStore, menuLabel } from '@/stores/menus';
import { sessionStore } from '@/stores/session';
import { t } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
import MenuEditor from './MenuEditor.vue';
const store = menusStore(), session = sessionStore();
const open = shallowRef(false), editing = shallowRef<AdminMenu | null>(null), removing = shallowRef<AdminMenu | null>(null), busy = shallowRef(false), error = shallowRef(''), notice = shallowRef<'menus.saved' | 'menus.deleted' | ''>('');
interface MenuRow extends AdminMenu { children: MenuRow[] }
const rows = computed<MenuRow[]>(() => {
  const nodes = [...store.records].sort((a, b) => a.order - b.order).map((row): MenuRow => ({ ...row, children: [] }));
  const indexed = new Map(nodes.map((row) => [row.id, row]));
  const roots: MenuRow[] = [];
  for (const row of nodes) {
    const parent = indexed.get(row.parentId);
    if (parent && parent !== row) parent.children.push(row);
    else roots.push(row);
  }
  return roots;
});
const setting = computed<SaxGridSetting<MenuRow>>(() => ({
  rowKey: 'id',
  treeConfig: { children: 'children', expandAll: true, line: true },
  columns: [
    { field: 'titleZh', title: t('menus.titleZh'), minWidth: 200, treeNode: true },
    { field: 'titleEn', title: t('menus.titleEn'), minWidth: 180 },
    { field: 'kind', title: t('menus.kind'), width: 90, slots: { default: 'kind' } },
    { field: 'parentId', title: t('menus.parent'), minWidth: 130, slots: { default: 'parent' } },
    { field: 'path', title: t('menus.path'), minWidth: 150 },
    { field: 'icon', title: t('menus.icon'), width: 70, slots: { default: 'icon' } },
    { field: 'order', title: t('menus.order'), width: 75 },
    { field: 'enabled', title: t('menus.enabled'), width: 90, slots: { default: 'enabled' } },
    { field: 'id', title: t('users.actions'), width: 150, slots: { default: 'actions' } },
  ],
}));
function edit(row: AdminMenu | null) { editing.value = row; error.value = ''; open.value = true; }
async function save(input: MenuInput) {
  busy.value = true; error.value = '';
  try { if (editing.value) await menusApi.update(editing.value.id, input); else await menusApi.create(input); await store.refresh(); open.value = false; notice.value = 'menus.saved'; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : t('error.save'); }
  finally { busy.value = false; }
}
async function remove() {
  if (!removing.value) return;
  busy.value = true; error.value = '';
  try { await menusApi.remove(removing.value.id); await store.refresh(); removing.value = null; notice.value = 'menus.deleted'; }
  catch (cause) { error.value = cause instanceof Error ? cause.message : t('error.delete'); }
  finally { busy.value = false; }
}
function parentName(id: string) { const row = store.records.find((row) => row.id === id); return row ? menuLabel(row) : t('menus.root'); }
</script>
<template>
  <PageHeading :title="t('nav.menus')" :caption="t('menus.caption')" eyebrow="NAVIGATION"><div class="menu-actions"><SButton type="flat" :loading="store.busy" @click="store.refresh">{{ t('common.refresh') }}</SButton><SButton :disabled="!session.isAdmin" @click="edit(null)">{{ t('menus.new') }}</SButton></div></PageHeading>
  <SAlert v-if="notice" color="success" class="menu-notice">{{ t(notice) }}</SAlert>
  <SAlert v-if="store.error" color="danger" class="menu-notice">{{ store.error }}</SAlert>
  <SCard class="admin-card"><STable v-bind="setting" :data="rows" :loading="store.busy">
    <template #kind="{ row }">{{ t(row.kind === 'group' ? 'menus.group' : 'menus.page') }}</template>
    <template #parent="{ row }">{{ parentName(row.parentId) }}</template>
    <template #icon="{ row }"><SIcon :name="row.icon" :size="20" /></template>
    <template #enabled="{ row }"><STag :color="row.enabled ? 'success' : 'warn'">{{ t(row.enabled ? 'menus.enabled' : 'menus.hidden') }}</STag></template>
    <template #actions="{ row }"><div class="table-row-actions"><SButton size="small" type="flat" :disabled="!session.isAdmin" @click="edit(row)">{{ t('menus.actionEdit') }}</SButton><SButton size="small" type="flat" color="danger" :disabled="!session.isAdmin" @click="removing = row; error = ''">{{ t('menus.actionDelete') }}</SButton></div></template>
  </STable></SCard>
  <SAlert class="menu-notice" color="primary">{{ t('menus.storage') }}</SAlert>
  <MenuEditor v-model:open="open" :menu="editing" :busy="busy" :error="error" @save="save" />
  <SDialog :model-value="Boolean(removing)" :title="t('menus.remove')" width="440px" @update:model-value="(value) => { if (!value) removing = null; }">
    <p>{{ t('menus.confirmDelete', { name: removing ? menuLabel(removing) : '' }) }}</p><SAlert v-if="error" color="danger">{{ error }}</SAlert>
    <template #footer><div class="menu-actions"><SButton type="flat" @click="removing = null">{{ t('common.cancel') }}</SButton><SButton color="danger" :loading="busy" @click="remove">{{ t('menus.remove') }}</SButton></div></template>
  </SDialog>
</template>
<style scoped>
.menu-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.menu-notice { margin-block: 16px; }
</style>
