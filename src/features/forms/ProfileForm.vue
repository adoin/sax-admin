<script setup lang="ts">
import { computed, reactive, shallowRef } from "vue";
import { SCard, SForm, SButton, SAlert, SAvatar, STag } from "sax-design-vue";
import type { FormItemConfig, FormInstance } from "sax-design-vue";
import { t, departmentLabel } from "@/i18n";
import { departmentOptions } from "@/features/users/config";
interface Profile {
  name: string;
  email: string;
  department: string;
  bio: string;
  notifications: boolean;
}
const model = reactive<Profile>({
    name: "Alex Morgan",
    email: "alex@example.com",
    department: "engineering",
    bio: "",
    notifications: true,
  }),
  form = shallowRef<FormInstance>(),
  saved = shallowRef(false);
const items = computed<FormItemConfig<Profile>[]>(() => [
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
async function save() {
  saved.value = Boolean(await form.value?.validate());
}
</script>
<template>
  <div class="grid xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5">
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
    ><SCard
      class="admin-card"
      type="profile"
      :title="model.name"
      :subtitle="t('forms.review')"
      ><template #img
        ><div class="flex justify-center p-8 bg-blue-50 dark:bg-slate-800">
          <SAvatar :size="64" shape="circle"
            ><template #text>{{ model.name }}</template></SAvatar
          >
        </div></template
      ><template #text
        ><p class="text-muted text-sm">{{ model.email }}</p>
        <STag>{{ departmentLabel(model.department) }}</STag>
        <p class="leading-7 text-sm mt-5 whitespace-pre-wrap">
          {{ model.bio || t("forms.bioPlaceholder") }}
        </p></template
      ></SCard
    >
  </div>
</template>
