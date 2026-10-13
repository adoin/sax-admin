<script setup lang="ts">
import { t } from "@/i18n";
import { ArrowUpRight } from "lucide-vue-next";
import { RouterLink } from "vue-smart-router";
import type { Activity } from "@/api/contracts";
defineProps<{ activities: Activity[] }>();
</script>
<template>
  <section class="panel">
    <div class="flex justify-between items-center mb-5">
      <h2 class="section-title m-0">{{ t("dashboard.activity") }}</h2>
      <RouterLink
        to="/users"
        class="text-12px text-brand flex gap-1 items-center"
        >{{ t("dashboard.manage") }}<ArrowUpRight :size="14"
      /></RouterLink>
    </div>
    <div
      v-for="(item, i) in activities"
      :key="item.id"
      class="flex items-start gap-3 py-3"
    >
      <span
        class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-11px font-600"
        :class="
          i % 2 ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'
        "
        >{{ item.name.slice(-2) }}</span
      >
      <div class="flex-1">
        <p class="text-12px mt-0 mb-1">
          <b class="font-600">{{ item.name }}</b>
          <span class="text-muted ml-1">{{ t(item.action) }}</span>
        </p>
        <span class="text-10px text-muted">{{
          t("activity.time", { minutes: item.minutes })
        }}</span>
      </div>
    </div>
  </section>
</template>
