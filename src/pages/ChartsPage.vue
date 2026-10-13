<script setup lang="ts">
import { t } from "@/i18n";
import { computed, onMounted, shallowRef } from "vue";
import { SButton } from "sax-design-vue";
import { RefreshCw, Cpu, Activity, MousePointer2 } from "lucide-vue-next";
import { dashboardApi } from "@/api";
import GpuChart from "@/components/charts/GpuChart.vue";
import PageHeading from "@/components/common/PageHeading.vue";
const data = shallowRef<[number, number][]>([]),
  busy = shallowRef(false),
  error = shallowRef(""),
  mode = shallowRef<
    "charts.detecting" | "charts.gpuReady" | "charts.fallbackMode"
  >("charts.detecting"),
  type = shallowRef<"line" | "bar" | "scatter">("line"),
  count = shallowRef(20000);
const series = computed(() => [
  {
    name: t("charts.load"),
    color: "#3b82f6",
    data: data.value.slice(0, count.value),
  },
]);
async function refresh() {
  busy.value = true;
  error.value = "";
  try {
    data.value = await dashboardApi.analytics();
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("error.request");
  } finally {
    busy.value = false;
  }
}
onMounted(refresh);
</script>
<template>
  <PageHeading
    :title="t('charts.title')"
    :caption="t('charts.caption')"
    eyebrow="ANALYTICS"
    ><SButton type="flat" :loading="busy" @click="refresh"
      ><RefreshCw :size="15" class="mr-2" />{{ t("charts.generate") }}</SButton
    ></PageHeading
  >
  <div class="grid md:grid-cols-3 gap-5 mb-5">
    <div
      v-for="item in [
        {
          title: t('charts.engine'),
          value: 'ChartGPU',
          icon: Cpu,
          caption: t('charts.native'),
        },
        {
          title: t('charts.scale'),
          value: count.toLocaleString(),
          icon: Activity,
          caption: t('charts.samples'),
        },
        {
          title: t('charts.status'),
          value: t(mode),
          icon: MousePointer2,
          caption: t('charts.compatibility'),
        },
      ]"
      :key="item.title"
      class="panel flex gap-4 items-center"
    >
      <span class="rounded-3 bg-blue-50 text-brand p-3"
        ><component :is="item.icon" :size="21"
      /></span>
      <div>
        <p class="text-muted text-xs m-0">{{ item.title }}</p>
        <b class="text-xl block my-1">{{ item.value }}</b
        ><span class="text-11px text-muted">{{ item.caption }}</span>
      </div>
    </div>
  </div>
  <section class="panel">
    <div class="flex flex-wrap gap-5 justify-between items-start mb-7">
      <div>
        <h2 class="section-title m-0">{{ t("charts.loadTitle") }}</h2>
        <p class="page-caption">{{ t("charts.loadCaption") }}</p>
      </div>
      <div class="flex gap-4 flex-wrap">
        <div class="flex bg-slate-50 dark:bg-slate-800 rounded-3 p-1">
          <button
            v-for="t in [
              { value: 'line', label: t('charts.line') },
              { value: 'bar', label: t('charts.bar') },
              { value: 'scatter', label: t('charts.scatter') },
            ] as const"
            :key="t.value"
            class="border-0 px-4 py-2 rounded-2 text-xs"
            :class="
              type === t.value
                ? 'bg-white text-brand shadow-sm dark:bg-slate-700'
                : 'bg-transparent text-muted'
            "
            @click="type = t.value"
          >
            {{ t.label }}
          </button>
        </div>
        <label class="flex gap-2 items-center text-12px text-muted"
          >{{ t("charts.count")
          }}<select
            v-model="count"
            class="bg-slate-50 dark:bg-slate-800 rounded-3 p-2.5 border-0"
            :aria-label="t('charts.countLabel')"
          >
            <option :value="1000">1,000</option>
            <option :value="5000">5,000</option>
            <option :value="20000">20,000</option>
          </select></label
        >
      </div>
    </div>
    <p v-if="error" role="alert" class="text-red-600">{{ error }}</p>
    <div v-if="busy" class="py-15 text-center text-muted" role="status">
      {{ t("charts.generating") }}
    </div>
    <GpuChart
      v-else-if="data.length"
      :series="series"
      :type="type"
      :height="380"
      @ready="
        (m) => (mode = m === 'gpu' ? 'charts.gpuReady' : 'charts.fallbackMode')
      "
    />
  </section>
  <div class="grid md:grid-cols-2 gap-5 mt-5">
    <section class="panel">
      <h2 class="section-title m-0">{{ t("charts.largeTitle") }}</h2>
      <p class="page-caption">{{ t("charts.largeBody") }}</p>
    </section>
    <section class="panel">
      <h2 class="section-title m-0">{{ t("charts.browserTitle") }}</h2>
      <p class="page-caption">{{ t("charts.browserBody") }}</p>
    </section>
  </div>
</template>
