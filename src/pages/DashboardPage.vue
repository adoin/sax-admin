<script setup lang="ts">
import { t, locale } from "@/i18n";
import { computed, onMounted, shallowRef } from "vue";
import { RouterLink } from "vue-smart-router";
import { SButton } from "sax-design-vue";
import {
  ArrowUpRight,
  RefreshCw,
  CalendarDays,
  Sparkles,
  Users,
  Map,
  ChartNoAxesCombined,
} from "lucide-vue-next";
import { dashboardApi } from "@/api";
import type { Dashboard } from "@/api/contracts";
import PageHeading from "@/components/common/PageHeading.vue";
import MetricCards from "@/components/dashboard/MetricCards.vue";
import ChannelPanel from "@/components/dashboard/ChannelPanel.vue";
import ActivityPanel from "@/components/dashboard/ActivityPanel.vue";
import GpuChart from "@/components/charts/GpuChart.vue";
const data = shallowRef<Dashboard>(),
  busy = shallowRef(false),
  error = shallowRef("");
const period = shallowRef(30);
const series = computed(() =>
  data.value
    ? [
        {
          name: t("dashboard.currentRevenue"),
          color: "#3b82f6",
          data: data.value.revenue.slice(-period.value),
        },
        {
          name: t("dashboard.previousRevenue"),
          color: "#b3c8ed",
          data: data.value.previousRevenue.slice(-period.value),
        },
      ]
    : [],
);
const total = computed(
  () =>
    data.value?.revenue
      .slice(-period.value)
      .reduce((sum, p) => sum + p[1], 0)
      .toLocaleString() || "0",
);
async function refresh() {
  busy.value = true;
  error.value = "";
  try {
    data.value = await dashboardApi.overview();
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("error.load");
  } finally {
    busy.value = false;
  }
}
onMounted(refresh);
</script>
<template>
  <PageHeading
    :title="t('dashboard.title')"
    :caption="t('dashboard.caption')"
    eyebrow="OVERVIEW"
    ><span
      class="hidden sm:flex items-center gap-2 text-12px text-muted bg-white dark:bg-slate-900 rounded-3 px-4 py-2.5"
      ><CalendarDays :size="15" />{{
        new Date().toLocaleDateString(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }}</span
    ><SButton type="flat" :loading="busy" @click="refresh"
      ><RefreshCw :size="15" class="mr-2" />{{ t("common.refresh") }}</SButton
    ></PageHeading
  >
  <p v-if="error" role="alert" class="panel text-red-600">
    {{ error }} <button @click="refresh">{{ t("common.retry") }}</button>
  </p>
  <div
    v-if="!data && busy"
    class="panel py-20 text-center text-muted"
    role="status"
  >
    {{ t("dashboard.loading") }}
  </div>
  <template v-if="data">
    <MetricCards :metrics="data.metrics" />
    <div
      class="grid xl:grid-cols-[minmax(0,2.1fr)_minmax(290px,1fr)] gap-5 mt-5"
    >
      <section class="panel min-w-0">
        <div class="flex flex-wrap justify-between gap-3 items-start">
          <div>
            <h2 class="section-title m-0">{{ t("dashboard.revenue") }}</h2>
            <p class="text-12px text-muted mt-2">
              {{ t("dashboard.revenueCaption") }}
            </p>
          </div>
          <div class="flex gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-2">
            <button
              v-for="p in [7, 30]"
              :key="p"
              class="border-0 px-3 py-1.5 rounded-2 text-11px"
              :class="
                period === p
                  ? 'bg-white text-brand shadow-sm dark:bg-slate-700'
                  : 'bg-transparent text-muted'
              "
              @click="period = p"
            >
              {{ t("dashboard.days", { days: p }) }}
            </button>
          </div>
        </div>
        <div class="flex justify-between items-center mb-5">
          <p class="text-7 font-650 tabular m-0">
            ¥{{ total
            }}<span class="text-11px text-emerald-600 ml-3 font-500"
              >↗ 18.6%</span
            >
          </p>
          <span class="text-11px text-muted flex gap-4"
            ><span
              ><i
                class="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"
              />{{ t("dashboard.thisMonth") }}</span
            ><span
              ><i
                class="inline-block w-1.5 h-1.5 rounded-full bg-blue-200 mr-1.5"
              />{{ t("dashboard.lastMonth") }}</span
            ></span
          >
        </div>
        <GpuChart :series="series" :height="230" />
      </section>
      <ChannelPanel :channels="data.channels" />
    </div>
    <div
      class="grid xl:grid-cols-[minmax(0,2.1fr)_minmax(290px,1fr)] gap-5 mt-5"
    >
      <section class="panel">
        <div class="flex items-center justify-between">
          <h2 class="section-title m-0">{{ t("dashboard.explore") }}</h2>
          <span class="text-11px text-muted">{{
            t("dashboard.exploreCaption")
          }}</span>
        </div>
        <div class="grid sm:grid-cols-3 gap-4 mt-6">
          <RouterLink
            v-for="item in [
              {
                to: '/users',
                title: t('dashboard.team'),
                caption: t('dashboard.teamCaption'),
                icon: Users,
                color: 'text-blue-500 bg-blue-50',
              },
              {
                to: '/charts',
                title: t('dashboard.data'),
                caption: t('dashboard.dataCaption'),
                icon: ChartNoAxesCombined,
                color: 'text-violet-500 bg-violet-50',
              },
              {
                to: '/maps',
                title: t('dashboard.geo'),
                caption: t('dashboard.geoCaption'),
                icon: Map,
                color: 'text-emerald-500 bg-emerald-50',
              },
            ]"
            :key="item.to"
            :to="item.to"
            class="rounded-4 bg-slate-50 dark:bg-slate-800 p-5 hover:bg-blue-50 dark:hover:bg-slate-700"
            ><span
              class="w-10 h-10 rounded-3 flex items-center justify-center"
              :class="item.color"
              ><component :is="item.icon" :size="20"
            /></span>
            <h3
              class="text-13px font-600 mt-5 mb-2 flex justify-between items-center"
            >
              {{ item.title }}<ArrowUpRight :size="14" class="text-muted" />
            </h3>
            <p class="text-11px text-muted m-0">
              {{ item.caption }}
            </p></RouterLink
          >
        </div>
        <div
          class="mt-5 rounded-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-slate-800 p-4 flex gap-3 items-center"
        >
          <Sparkles :size="19" class="text-brand shrink-0" />
          <p class="text-12px text-slate-500 dark:text-slate-300 m-0">
            {{ t("dashboard.tip") }}
          </p>
        </div>
      </section>
      <ActivityPanel :activities="data.activities" />
    </div>
  </template>
</template>
