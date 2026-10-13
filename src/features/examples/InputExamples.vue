<script setup lang="ts">
import { shallowRef } from "vue";
import {
  SCard,
  SSwitch,
  SCheckbox,
  SSlider,
  SInputNumber,
  SRate,
  SSelect,
  SInput,
  STextarea,
} from "sax-design-vue";
import { t } from "@/i18n";
import { roleOptions } from "@/features/users/config";
const enabled = shallowRef(true),
  subscribed = shallowRef(false),
  priority = shallowRef(40),
  rating = shallowRef(4),
  role = shallowRef("viewer"),
  name = shallowRef(""),
  message = shallowRef("");
</script>
<template>
  <div class="grid md:grid-cols-2 gap-5">
    <SCard class="admin-card" :title="t('examples.switch')"
      ><div class="flex flex-wrap items-center gap-7">
        <label class="flex gap-3 items-center"
          ><SSwitch v-model="enabled" :aria-label="t('examples.enable')" />{{
            t("examples.enable")
          }}</label
        ><SCheckbox v-model="subscribed">{{
          t("examples.subscribe")
        }}</SCheckbox>
      </div></SCard
    ><SCard class="admin-card" :title="t('examples.slider')"
      ><label class="block text-muted text-sm mb-4"
        >{{ t("examples.priority") }}: {{ priority }}</label
      ><SSlider
        v-model="priority"
        :step="10"
        show-value
        :aria-label="t('examples.priority')" /><SInputNumber
        v-model="priority"
        :min="0"
        :max="100"
        :step="10"
        :aria-label="t('examples.priority')"
        class="mt-5" /></SCard
    ><SCard
      class="admin-card"
      :title="t('examples.rating')"
      :subtitle="t('examples.ratingCaption')"
      ><SRate v-model="rating" :aria-label="t('examples.rating')" /></SCard
    ><SCard class="admin-card" :title="t('examples.select')"
      ><div class="grid gap-4">
        <SSelect
          v-model="role"
          :options="roleOptions"
          :placeholder="t('examples.choose')"
          :aria-label="t('users.role')"
        /><SInput
          v-model="name"
          :placeholder="t('users.namePlaceholder')"
          block
          clearable
        /><STextarea
          v-model="message"
          :placeholder="t('examples.messagePlaceholder')"
          :label="t('examples.message')"
          :counter="200"
        /></div
    ></SCard>
  </div>
</template>
