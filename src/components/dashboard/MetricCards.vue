<script setup lang="ts">
import { SCard } from "sax-design-vue";
import { t } from "@/i18n";
import { computed } from "vue";
import {
  Wallet,
  Users,
  ShoppingBag,
  MousePointer2,
  ArrowUpRight,
} from "lucide-vue-next";
import type { Metric } from "@/api/contracts";
const props = defineProps<{ metrics: Metric[]; loading?: boolean }>();
const icons = [Wallet, Users, ShoppingBag, MousePointer2],
  colors = ["#3b82f6", "#8b5cf6", "#21b99a", "#f0aa3c"] as const;
const cards = computed(() =>
  props.metrics.map((m, i) => ({
    ...m,
    icon: icons[i],
    color: colors[i % colors.length]!,
    spark: m.trend.map((n, j) => `${j * 9},${46 - n * 0.42}`).join(" "),
    display:
      m.unit === "¥"
        ? `¥${m.value.toLocaleString()}`
        : `${m.value.toLocaleString()}${m.unit}`,
  })),
);
</script>
<template>
  <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
    <article v-for="m in cards" :key="m.label" class="relative">
      <SCard
        class="admin-card"
        hover-effect="lift"
        effect="spotlight"
        :color="m.color"
        :loading="loading"
      >
        <div class="flex items-center justify-between">
          <span class="text-13px text-muted">{{ t(m.label) }}</span
          ><span
            class="w-10 h-10 rounded-3 flex items-center justify-center"
            :style="{ color: m.color, background: `${m.color}12` }"
            ><component :is="m.icon" :size="19"
          /></span>
        </div>
        <p class="text-8 font-700 tabular tracking-tight mt-4 mb-5">
          {{ m.display }}
        </p>
        <div class="flex gap-2 items-center text-11px">
          <span class="text-emerald-600 flex items-center gap-0.5"
            ><ArrowUpRight :size="13" />{{ m.change }}%</span
          ><span class="text-muted">{{ t("dashboard.vsLast") }}</span>
        </div>
        <svg
          class="absolute w-24 h-12 bottom-4 right-5 opacity-80"
          viewBox="0 0 100 50"
          aria-hidden="true"
        >
          <polyline
            :points="m.spark"
            fill="none"
            :stroke="m.color"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </SCard>
    </article>
  </div>
</template>
