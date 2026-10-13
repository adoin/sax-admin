<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue';
import { SDialog, SForm, SButton, SAlert } from 'sax-design-vue';
import type { FormInstance, FormItemConfig } from 'sax-design-vue';
import type { AdminEntry, AdminInput, DepartmentEntry, Permission, ResourceKind } from '@/api/admin-contracts';
import { permissionKeys } from '@/api/admin-contracts';
import { entryName } from './entity-utils';
import { t } from '@/i18n';
const props = defineProps<{ kind: ResourceKind; entry: AdminEntry | null; departments: DepartmentEntry[]; open: boolean; busy: boolean; error: string }>();
const emit = defineEmits<{ 'update:open': [value: boolean]; save: [value: AdminInput] }>();
interface Draft { nameZh: string; nameEn: string; code: string; enabled: boolean; description: string; permissions: Permission[]; parentId: string; manager: string; email: string; category: string; value: string }
const defaults = (): Draft => ({ nameZh: '', nameEn: '', code: '', enabled: true, description: '', permissions: [], parentId: '', manager: '', email: '', category: 'status', value: '' });
const model = reactive<Draft>(defaults()), form = shallowRef<FormInstance>();
watch(() => props.open, (open) => { if (open) { Object.assign(model, defaults(), props.entry || {}); form.value?.clearValidate(); } });
const items = computed<FormItemConfig<Draft>[]>(() => {
  const fields: FormItemConfig<Draft>[] = [
    { field: 'nameZh', title: t('business.nameZh'), span: 12, rules: { required: true, message: t('business.invalid') }, itemRender: { name: '$input' } },
    { field: 'nameEn', title: t('business.nameEn'), span: 12, rules: { required: true, message: t('business.invalid') }, itemRender: { name: '$input' } },
    { field: 'code', title: t('business.code'), span: 12, rules: { required: true, message: t('business.invalid') }, itemRender: { name: '$input' } },
    { field: 'enabled', title: t('business.state'), span: 12, itemRender: { name: '$switch' } },
  ];
  if (props.kind === 'roles') fields.push({ field: 'permissions', title: t('roles.permissions'), span: 24, itemRender: { name: '$checkboxGroup', options: permissionKeys.map((value) => ({ value, label: t(`perm.${value}`) })) } });
  if (props.kind === 'departments') fields.push(
    { field: 'parentId', title: t('departments.parent'), span: 24, itemRender: { name: '$select', options: [{ value: '', label: t('departments.root') }, ...props.departments.filter((row) => row.id !== props.entry?.id).map((row) => ({ value: row.id, label: entryName(row) }))] } },
    { field: 'manager', title: t('departments.manager'), span: 12, itemRender: { name: '$input' } },
    { field: 'email', title: t('departments.email'), span: 12, itemRender: { name: '$input' } },
  );
  if (props.kind === 'dictionaries') fields.push({ field: 'category', title: t('dictionaries.category'), span: 12, itemRender: { name: '$input' } }, { field: 'value', title: t('dictionaries.value'), span: 12, rules: { required: true, message: t('business.invalid') }, itemRender: { name: '$input' } });
  fields.push({ field: 'description', title: t('business.description'), span: 24, itemRender: { name: '$textarea', props: { rows: 3 } } });
  return fields;
});
async function save() {
  if (props.busy || !await form.value?.validate()) return;
  const base = { nameZh: model.nameZh, nameEn: model.nameEn, code: model.code, enabled: model.enabled, description: model.description };
  if (props.kind === 'roles') emit('save', { ...base, kind: props.kind, permissions: [...model.permissions] });
  else if (props.kind === 'departments') emit('save', { ...base, kind: props.kind, parentId: model.parentId, manager: model.manager, email: model.email });
  else emit('save', { ...base, kind: props.kind, category: model.category, value: model.value });
}
</script>
<template>
  <SDialog :model-value="open" :title="t(entry ? 'business.edit' : 'business.new')" width="720px" @update:model-value="emit('update:open', $event)">
    <SForm ref="form" :model="model" :items="items" label-position="top" :disabled="busy" @submit="save" />
    <SAlert v-if="error" color="danger">{{ error }}</SAlert>
    <template #footer><div class="flex gap-3 justify-end"><SButton type="flat" :disabled="busy" @click="emit('update:open', false)">{{ t('common.cancel') }}</SButton><SButton :loading="busy" @click="save">{{ t('common.save') }}</SButton></div></template>
  </SDialog>
</template>
