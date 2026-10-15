<script setup lang="ts">
import { SCard } from "sax-design-vue";
import { t } from "@/i18n";
import { computed } from "vue";
import type { Dashboard } from "@/api/contracts";
const props = defineProps<{ channels: Dashboard["channels"] }>();
const gradient = computed(() => {
  let start = 0;
  return `conic-gradient(${props.channels
    .map((c) => {
      const stop = start + c.value;
      const part = `${c.color} ${start}% ${stop}%`;
      start = stop;
      return part;
    })
    .join(",")})`;
});
</script>
<template>
  <section class="">
    <SCard class="admin-card" hover-effect="glow" color="success">
      <h2 class="section-title m-0">{{ t("dashboard.sources") }}</h2>
      <p class="text-12px text-muted mt-2">
        {{ t("dashboard.sourcesCaption") }}
      </p>
      <div
        class="w-40 h-40 rounded-full mx-auto my-6 p-5"
        :style="{ background: gradient }"
        role="img"
        :aria-label="channels.map((c) => `${t(c.name)} ${c.value}%`).join('，')"
      >
        <div
          class="rounded-full w-full h-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center"
        >
          <strong class="text-7 tabular"
            >100<span class="text-base">%</span></strong
          ><span class="text-11px text-muted">{{
            t("dashboard.totalVisits")
          }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-x-5 gap-y-4">
        <div
          v-for="c in channels"
          :key="c.name"
          class="flex items-center gap-2 text-12px"
        >
          <span
            class="w-2 h-2 rounded-full"
            :style="{ background: c.color }"
          /><span class="text-muted">{{ t(c.name) }}</span
          ><b class="ml-auto tabular font-600">{{ c.value }}%</b>
        </div>
      </div>
    </SCard>
  </section>
</template>
