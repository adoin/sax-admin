<script setup lang="ts">
import { computed, reactive, shallowRef } from "vue";
import { SCard, SForm, SButton, SAlert } from "sax-design-vue";
import type { FormItemConfig, FormInstance } from "sax-design-vue";
import { t } from "@/i18n";
import { departmentOptions } from "@/features/users/config";
interface Profile {
  name: string;
  email: string;
  department: string;
  bio: string;
  notifications: boolean;
}
const model = reactive<Profile>({
    name: "Adoin Wang",
    email: "adoin@example.com",
    department: "engineering",
    bio: "",
    notifications: true,
  }),
  form = shallowRef<FormInstance>(),
  saved = shallowRef(false);
const fields = computed<FormItemConfig<Profile>[]>(() => [
  {
    field: "name",
    title: t("users.name"),
    span: 12,
    rules: { required: true, message: t("users.nameRequired") },
    itemRender: { name: "$input" },
  },
  {
    field: "email",
    title: t("users.email"),
    span: 12,
    rules: {
      validator: (v) =>
        (typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ||
        t("users.emailInvalid"),
    },
    itemRender: { name: "$input" },
  },
  {
    field: "department",
    title: t("users.department"),
    span: 24,
    itemRender: { name: "$select", options: departmentOptions.value },
  },
  {
    field: "bio",
    title: t("forms.bio"),
    span: 24,
    itemRender: {
      name: "$textarea",
      props: { placeholder: t("forms.bioPlaceholder"), maxLength: 200 },
    },
  },
  {
    field: "notifications",
    title: t("forms.notifications"),
    span: 24,
    itemRender: { name: "$switch" },
  },
]);
const items = computed<FormItemConfig<Profile>[]>(() => [
  { title: t("forms.accountGroup"), children: fields.value.slice(0, 2) },
  { title: t("forms.workGroup"), children: fields.value.slice(2) },
]);
async function save() {
  saved.value = Boolean(await form.value?.validate());
}
</script>
<template>
    <SCard
      class="admin-card"
      :title="t('forms.profile')"
      :subtitle="t('forms.profileCaption')"
      ><SForm
        ref="form"
        :model="model"
        :items="items"
        label-position="top"
      /><SAlert v-if="saved" color="success" class="mt-3">{{
        t("forms.saved")
      }}</SAlert
      ><template #footer
        ><SButton @click="save">{{ t("forms.submit") }}</SButton></template
      ></SCard
    >
</template>
