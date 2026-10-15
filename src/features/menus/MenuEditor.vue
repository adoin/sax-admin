<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from "vue";
import {
  SDialog,
  SForm,
  SButton,
  SInputNumber,
  SAlert,
  SIconPicker,
  SIcon,
} from "sax-design-vue";
import zhCn from "sax-design-vue/es/locale/lang/zh-cn.mjs";
import en from "sax-design-vue/es/locale/lang/en.mjs";
import type { FormInstance, FormItemConfig } from "sax-design-vue";
import type { AdminMenu, MenuInput } from "@/api/menu-contracts";
import { menuIcons } from "@/api/menu-contracts";
import { menusStore, menuLabel } from "@/stores/menus";
import { t, locale } from "@/i18n";
const props = defineProps<{
  open: boolean;
  menu: AdminMenu | null;
  busy: boolean;
  error: string;
}>();
const emit = defineEmits<{
  "update:open": [value: boolean];
  save: [input: MenuInput];
}>();
const store = menusStore(),
  form = shallowRef<FormInstance>();
const defaults = (): MenuInput => ({
  titleZh: "",
  titleEn: "",
  kind: "page",
  parentId: "",
  path: "",
  icon: "nav:layout-dashboard",
  order: 0,
  enabled: true,
});
const model = reactive<MenuInput>(defaults());
watch(
  () => props.open,
  (open) => {
    if (open) {
      Object.assign(model, props.menu || defaults());
      form.value?.clearValidate();
    }
  },
);
const items = computed<FormItemConfig<MenuInput>[]>(() => [
  {
    field: "titleZh",
    title: t("menus.titleZh"),
    span: 12,
    rules: { required: true, message: t("menus.invalid") },
    itemRender: { name: "$input" },
  },
  {
    field: "titleEn",
    title: t("menus.titleEn"),
    span: 12,
    rules: { required: true, message: t("menus.invalid") },
    itemRender: { name: "$input" },
  },
  {
    field: "kind",
    title: t("menus.kind"),
    span: 12,
    itemRender: {
      name: "$select",
      options: [
        { label: t("menus.page"), value: "page" },
        { label: t("menus.group"), value: "group" },
      ],
    },
  },
  {
    field: "parentId",
    title: t("menus.parent"),
    span: 12,
    itemRender: {
      name: "$select",
      options: [
        { label: t("menus.root"), value: "" },
        ...store.records
          .filter((row) => row.kind === "group" && row.id !== props.menu?.id)
          .map((row) => ({ label: menuLabel(row), value: row.id })),
      ],
    },
  },
  ...(model.kind === "page"
    ? [
        {
          field: "path",
          title: t("menus.path"),
          span: 24,
          rules: { required: true, message: t("menus.invalidPath") },
          itemRender: {
            name: "$input",
            props: { placeholder: t("menus.pathPlaceholder") },
          },
          description: t("menus.pathHint"),
        } as FormItemConfig<MenuInput>,
      ]
    : []),
  {
    field: "icon",
    title: t("menus.icon"),
    span: 24,
    slots: { default: "icon" },
  },
  {
    field: "order",
    title: t("menus.order"),
    span: 12,
    slots: { default: "order" },
  },
  {
    field: "enabled",
    title: t("menus.enabled"),
    span: 12,
    itemRender: { name: "$switch" },
  },
]);
async function pickIcon() {
  if (props.busy) return;
  const selection = await SIconPicker({
    output: "code",
    iconList: menuIcons,
    initialIcon: model.icon,
    showName: true,
    title: t("menus.icon"),
    locale: locale.value === "zh-CN" ? zhCn : en,
  });
  if (selection && props.open && !props.busy) model.icon = selection.code;
}
async function submit() {
  if (!props.busy && (await form.value?.validate()))
    emit("save", {
      titleZh: model.titleZh,
      titleEn: model.titleEn,
      kind: model.kind,
      parentId: model.parentId,
      path: model.kind === "page" ? model.path : "",
      icon: model.icon,
      order: model.order,
      enabled: model.enabled,
    });
}
</script>
<template>
  <SDialog
    :model-value="open"
    :title="t(menu ? 'menus.edit' : 'menus.new')"
    width="680px"
    @update:model-value="emit('update:open', $event)"
  >
    <SForm
      ref="form"
      :model="model"
      :items="items"
      label-position="top"
      :disabled="busy"
      @submit="submit"
      ><template #icon
        ><div class="group relative inline-flex items-center" @click.prevent>
          <SButton type="flat" :class="{ 'pr-9': model.icon }" :disabled="busy" @click="pickIcon"
            ><SIcon v-if="model.icon" :name="model.icon" :size="20" /><span>{{
              model.icon || t("menus.chooseIcon")
            }}</span></SButton
          ><button
            v-if="model.icon"
            type="button"
            class="absolute right-1 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border-0 bg-transparent text-current cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 hover:bg-primary/10 disabled:cursor-not-allowed"
            :aria-label="t('menus.clearIcon')"
            :title="t('menus.clearIcon')"
            :disabled="busy"
            @click.stop="model.icon = ''"
            ><span aria-hidden="true">×</span></button
          >
        </div>
        <p class="text-xs text-muted mt-2 mb-0">
          {{ t("menus.iconStyle") }}
        </p></template
      ><template #order="{ id }"
        ><SInputNumber
          :id="id"
          :model-value="model.order"
          :value-on-clear="0"
          @update:model-value="model.order = $event ?? 0"
          :min="0"
          :max="9999"
          :disabled="busy"
          :aria-label="t('menus.order')" /></template
    ></SForm>
    <SAlert v-if="error" color="danger">{{ error }}</SAlert>
    <template #footer
      ><div class="editor-actions">
        <SButton
          type="flat"
          :disabled="busy"
          @click="emit('update:open', false)"
          >{{ t("common.cancel") }}</SButton
        ><SButton :loading="busy" @click="submit">{{
          t("common.save")
        }}</SButton>
      </div></template
    >
  </SDialog>
</template>
<style scoped>
.editor-actions {
  display: flex;
  justify-content: end;
  gap: 12px;
}
</style>
