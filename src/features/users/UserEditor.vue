<script setup lang="ts">
import { t } from "@/i18n";
import { reactive, shallowRef, watch } from "vue";
import { SDialog, SForm, SButton } from "sax-design-vue";
import type { FormInstance } from "sax-design-vue";
import type { User, UserInput } from "@/api/contracts";
import { userFormItems } from "./config";
const props = defineProps<{
  open: boolean;
  user: User | null;
  busy: boolean;
  error: string;
}>();
const emit = defineEmits<{
  "update:open": [value: boolean];
  save: [input: UserInput];
}>();
const model = reactive<UserInput>({
  name: "",
  email: "",
  department: "engineering",
  role: "viewer",
  status: "active",
});
const form = shallowRef<FormInstance>();
watch(
  () => props.open,
  (value) => {
    if (value) {
      Object.assign(
        model,
        props.user
          ? {
              name: props.user.name,
              email: props.user.email,
              department: props.user.department,
              role: props.user.role,
              status: props.user.status,
            }
          : {
              name: "",
              email: "",
              department: "engineering",
              role: "viewer",
              status: "active",
            },
      );
      form.value?.clearValidate();
    }
  },
);
async function submit() {
  if (!props.busy && (await form.value?.validate())) emit("save", { ...model });
}
</script>
<template>
  <SDialog
    :model-value="open"
    :title="user ? t('users.editorTitle') : t('users.inviteTitle')"
    width="520px"
    @update:model-value="emit('update:open', $event)"
    ><p class="text-muted text-sm mb-5">{{ t("users.editorCaption") }}</p>
    <SForm
      ref="form"
      :model="model"
      :items="userFormItems"
      label-position="top"
      :disabled="busy"
      @submit="submit"
    />
    <p v-if="error" class="text-red-600 text-sm" role="alert">{{ error }}</p>
    <template #footer
      ><div class="flex justify-end gap-3">
        <SButton
          type="flat"
          :disabled="busy"
          @click="emit('update:open', false)"
          >{{ t("common.cancel") }}</SButton
        ><SButton :loading="busy" @click="submit">{{
          user ? t("common.save") : t("users.create")
        }}</SButton>
      </div></template
    ></SDialog
  >
</template>
