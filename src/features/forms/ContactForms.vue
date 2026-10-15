<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { SFormGroup, SButton, SAlert } from "sax-design-vue";
import type { FormGroupInstance, FormGroupFormSetting, FormGroupItem } from "sax-design-vue";
import { t } from "@/i18n";
interface Contact { name: string; email: string }
const contacts = ref<FormGroupItem<Contact>[]>([
  { name: "Adoin Wang", email: "adoin@example.com" },
  { name: "", email: "" },
]);
const group = shallowRef<FormGroupInstance>();
const result = shallowRef<boolean>();
const setting = computed<FormGroupFormSetting>(() => ({
  labelPosition: "top",
  items: [
    { field: "name", title: t("forms.contactName"), span: 12,
      rules: { required: true, message: t("forms.contactRequired") },
      itemRender: { name: "$input" } },
    { field: "email", title: t("forms.contactEmail"), span: 12,
      rules: { validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) || t("users.emailInvalid") },
      itemRender: { name: "$input" } },
  ],
}));
const getFormSetting = () => setting.value;
const createItem = () => ({ name: "", email: "" });
const getTabLabel = (_item: FormGroupItem, index: number) => `${t("forms.contact")} ${index + 1}`;
async function validateAll() { result.value = await group.value?.validateAll(); }
</script>
<template>
  <SFormGroup ref="group" v-model="contacts" :get-form-setting="getFormSetting"
    :create-item="createItem" :get-tab-label="getTabLabel" :tab-label="t('forms.contact')"
    :aria-label="t('forms.contacts')" :empty-text="t('forms.contactEmpty')"
    :error-label="t('forms.invalidContacts')" tabs-type="pill" editable show-add :max="5"
    @update:model-value="result = undefined" @field-validate="result = undefined" />
  <div class="mt-4"><SButton :disabled="!contacts.length" @click="validateAll">{{ t('forms.validateAll') }}</SButton></div>
  <SAlert v-if="result !== undefined" class="mt-4" :color="result ? 'success' : 'warn'">
    {{ t(result ? 'forms.validContacts' : 'forms.invalidContacts') }}
  </SAlert>
</template>

