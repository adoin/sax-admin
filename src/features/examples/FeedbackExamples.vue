<script setup lang="ts">
import { shallowRef } from "vue";
import {
  SCard,
  SAlert,
  SProgress,
  SSkeleton,
  SEmpty,
  SButton,
  SDialog,
  STooltip,
} from "sax-design-vue";
import { t } from "@/i18n";
const loading = shallowRef(true),
  open = shallowRef(false);
</script>
<template>
  <div class="grid md:grid-cols-2 gap-5">
    <SCard class="admin-card" :title="t('examples.alerts')"
      ><div class="grid gap-3">
        <SAlert type="flat">{{ t("examples.alertInfo") }}</SAlert
        ><SAlert color="success" type="flat">{{
          t("examples.alertSuccess")
        }}</SAlert
        ><SAlert color="warn" type="flat">{{
          t("examples.alertWarning")
        }}</SAlert>
      </div></SCard
    ><SCard class="admin-card" :title="t('examples.progress')"
      ><div class="grid gap-6 py-4">
        <SProgress :percent="72" /><SProgress
          :percent="48"
          color="success"
          texture="waves"
          :height="12"
        /><SProgress
          :percent="90"
          color="warn"
          texture="sparkle"
          :height="12"
        /></div></SCard
    ><SCard class="admin-card" :title="t('examples.loading')"
      ><SSkeleton v-if="loading" /><SAlert v-else color="success">{{
        t("examples.loaded")
      }}</SAlert
      ><template #footer
        ><SButton type="flat" @click="loading = !loading">{{
          t("examples.toggleLoading")
        }}</SButton></template
      ></SCard
    ><SCard class="admin-card" :title="t('examples.empty')"
      ><SEmpty
        :description="t('examples.emptyCaption')"
        :image-size="100" /></SCard
    ><SCard class="admin-card" :title="t('examples.dialog')"
      ><SButton @click="open = true">{{
        t("examples.openDialog")
      }}</SButton></SCard
    ><SCard class="admin-card" :title="t('examples.tooltip')"
      ><STooltip :content="t('examples.tooltipBody')"
        ><SButton type="flat">{{ t("examples.hover") }}</SButton></STooltip
      ></SCard
    >
  </div>
  <SDialog v-model="open" :title="t('examples.dialog')" width="480px"
    ><p class="leading-7">{{ t("examples.dialogBody") }}</p>
    <template #footer
      ><SButton @click="open = false">{{
        t("common.close")
      }}</SButton></template
    ></SDialog
  >
</template>
