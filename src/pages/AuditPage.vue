<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue';
import { STable, SCard, STag, SButton, SAlert } from 'sax-design-vue';
import type { SaxGridSetting } from 'sax-design-vue';
import type { AuditEntry } from '@/api/admin-contracts';
import { auditApi } from '@/api/admin';
import { t, locale } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
interface Filters { keyword: string; module: string; status: string }
const filters = reactive<Filters>({ keyword: '', module: '', status: '' }), busy = shallowRef(false), error = shallowRef('');
const moduleLabel = (module: AuditEntry['module']) => module === 'session' ? t('audit.session') : t(`nav.${module}`);
const detail = (row: AuditEntry) => locale.value === 'zh-CN' ? row.detailZh : row.detailEn;
const actionLabel = (action: AuditEntry['action']) => t(`audit.${action}`);
const statusLabel = (status: AuditEntry['status']) => t(`audit.${status}`);
const time = (value: string) => new Date(value).toLocaleString(locale.value, { timeZone: 'Asia/Shanghai' });
const setting = computed<SaxGridSetting<AuditEntry, Filters>>(() => ({
  rowKey: 'id', columns: [
    { field: 'actor', title: t('audit.actor'), minWidth: 150 }, { field: 'action', title: t('audit.action'), width: 100, slots: { default: 'action' } },
    { field: 'module', title: t('audit.module'), minWidth: 150, slots: { default: 'module' } }, { field: 'status', title: t('audit.result'), width: 100, slots: { default: 'status' } },
    { field: 'detailZh', title: t('audit.detail'), minWidth: 220, slots: { default: 'detail' } }, { field: 'time', title: t('audit.time'), minWidth: 190, slots: { default: 'time' } }, { field: 'address', title: t('audit.address'), minWidth: 150 },
  ], queryConfig: { model: filters, labelPosition: 'top', items: [
    { field: 'keyword', title: t('audit.search'), span: 12, itemRender: { name: '$input', props: { clearable: true } } },
    { field: 'module', title: t('audit.module'), span: 6, itemRender: { name: '$select', options: [{ value: '', label: t('business.all') }, ...(['roles', 'departments', 'dictionaries', 'menus', 'session'] as const).map((value) => ({ value, label: moduleLabel(value) }))] } },
    { field: 'status', title: t('audit.result'), span: 6, itemRender: { name: '$select', options: [{ value: '', label: t('business.all') }, { value: 'success', label: t('audit.success') }, { value: 'failed', label: t('audit.failed') }] } },
  ] }, toolbarConfig: { title: t('nav.audit'), right: [{ itemRender: '$refresh' }, { itemRender: '$columnConfig' }] }, pagerConfig: { remote: true, currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50] },
  proxyConfig: { autoLoad: true, autoQuery: true, query: async ({ form, pager }) => { const result = await auditApi.list({ ...form, page: pager ? pager.currentPage || 1 : 1, pageSize: pager ? pager.pageSize || 10 : 10 }); return { data: result.items, total: result.total }; } },
}));
async function exportRows() {
  busy.value = true; error.value = '';
  try {
    const result = await auditApi.list({ ...filters, page: 1, pageSize: 2000 });
    const escape = (value: string) => `"${(/^[=+@-]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
    const rows = [[t('audit.actor'), t('audit.action'), t('audit.module'), t('audit.time'), t('audit.detail')], ...result.items.map((row) => [row.actor, t(`audit.${row.action}`), moduleLabel(row.module), time(row.time), detail(row)])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map((row) => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'audit-logs.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (cause) { error.value = cause instanceof Error ? cause.message : t('error.request'); }
  finally { busy.value = false; }
}
</script>
<template><div class="feature-page">
  <PageHeading :title="t('nav.audit')" :caption="t('audit.caption')" eyebrow="AUDIT"><SButton :loading="busy" @click="exportRows">{{ t('audit.export') }}</SButton></PageHeading>
  <SAlert v-if="error" color="danger">{{ error }}</SAlert>
  <SCard class="admin-card"><STable v-bind="setting"><template #action="{ row }">{{ actionLabel(row.action) }}</template><template #module="{ row }">{{ moduleLabel(row.module) }}</template><template #status="{ row }"><STag :color="row.status === 'success' ? 'success' : 'danger'">{{ statusLabel(row.status) }}</STag></template><template #detail="{ row }">{{ detail(row) }}</template><template #time="{ row }">{{ time(row.time) }}</template></STable></SCard>
</div></template>
