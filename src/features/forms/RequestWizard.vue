<script setup lang="ts">
import { computed, reactive, shallowRef } from "vue";
import {
  SCard,
  SSteps,
  SForm,
  SButton,
  SAlert,
  SInputNumber,
} from "sax-design-vue";
import type { FormItemConfig, FormInstance } from "sax-design-vue";
import { t } from "@/i18n";
const step = shallowRef(0),
  form = shallowRef<FormInstance>(),
  model = reactive({ name: "", budget: 10000, category: "internal" });
const items = computed<FormItemConfig<typeof model>[]>(() => [
  {
    field: "name",
    title: t("forms.projectName"),
    rules: { required: true, message: t("forms.projectNameRequired") },
    itemRender: { name: "$input" },
  },
  // The shared registry has no number renderer; the slot still uses the library control.
  { field: "budget", title: t("forms.budget"), slots: { default: "budget" } },
  {
    field: "category",
    title: t("forms.category"),
    itemRender: {
      name: "$select",
      options: [
        { label: t("forms.internal"), value: "internal" },
        { label: t("forms.external"), value: "external" },
      ],
    },
  },
]);
const steps = computed(() => [
  { title: t("forms.fill") },
  { title: t("forms.confirmStep") },
  { title: t("forms.completeStep") },
]);
async function next() {
  if (await form.value?.validate()) step.value = 1;
}
function restart() {
  step.value = 0;
  Object.assign(model, { name: "", budget: 10000, category: "internal" });
}
</script>
<template>
  <SCard
    class="admin-card"
    :title="t('forms.workflow')"
    :subtitle="t('forms.workflowCaption')"
    ><SSteps :items="steps" :active="step" class="mb-7" /><SForm
      v-if="step === 0"
      ref="form"
      :model="model"
      :items="items"
      label-position="top"
      ><template #budget
        ><SInputNumber
          v-model="model.budget"
          :min="100"
          :max="1000000"
          :step="100"
          :aria-label="t('forms.budget')" /></template
    ></SForm>
    <div v-else-if="step === 1" class="grid sm:grid-cols-3 gap-5 py-6">
      <div
        v-for="item in [
          { label: t('forms.projectName'), value: model.name },
          {
            label: t('forms.budget'),
            value: `¥${model.budget.toLocaleString()}`,
          },
          {
            label: t('forms.category'),
            value: t(
              model.category === 'internal'
                ? 'forms.internal'
                : 'forms.external',
            ),
          },
        ]"
        :key="item.label"
      >
        <p class="text-muted text-xs">{{ item.label }}</p>
        <b>{{ item.value }}</b>
      </div>
    </div>
    <SAlert v-else color="success"
      ><template #title>{{ t("forms.success") }}</template
      >{{ t("forms.successCaption") }}</SAlert
    ><template #footer
      ><div class="flex justify-end gap-3">
        <SButton v-if="step === 1" type="flat" @click="step = 0">{{
          t("forms.previous")
        }}</SButton
        ><SButton v-if="step === 0" @click="next">{{ t("forms.next") }}</SButton
        ><SButton v-else-if="step === 1" @click="step = 2">{{
          t("forms.confirm")
        }}</SButton
        ><SButton v-else @click="restart">{{ t("forms.restart") }}</SButton>
      </div></template
    ></SCard
  >
</template>
