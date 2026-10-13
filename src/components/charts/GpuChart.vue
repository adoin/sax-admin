<script setup lang="ts">
import { t } from "@/i18n";
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { ChartGPU } from "chartgpu";
import { preferencesStore } from "@/stores/preferences";
export interface ChartSeries {
  name: string;
  color: string;
  data: [number, number][];
}
const props = withDefaults(
  defineProps<{
    series: ChartSeries[];
    height?: number;
    type?: "line" | "bar" | "scatter";
  }>(),
  { height: 280, type: "line" },
);
const emit = defineEmits<{ ready: [mode: "gpu" | "fallback"] }>();
const host = shallowRef<HTMLDivElement>(),
  mode = shallowRef<"loading" | "gpu" | "fallback">("loading"),
  message = shallowRef("");
const preferences = preferencesStore();
let instance: Awaited<ReturnType<typeof ChartGPU.create>> | undefined,
  observer: ResizeObserver | undefined,
  disposed = false,
  revision = 0;
const paths = computed(() => {
  const all = props.series.flatMap((s) => s.data),
    minX = Math.min(...all.map((p) => p[0])),
    maxX = Math.max(...all.map((p) => p[0])),
    maxY = Math.max(1, ...all.map((p) => p[1])) * 1.12;
  return props.series.map((s) => ({
    name: s.name,
    color: s.color,
    path: s.data
      .filter((_, i) => i % Math.max(1, Math.ceil(s.data.length / 300)) === 0)
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${40 + ((p[0] - minX) / Math.max(1, maxX - minX)) * 900},${240 - (p[1] / maxY) * 210}`,
      )
      .join(" "),
  }));
});
async function render() {
  const ticket = ++revision;
  instance?.dispose();
  instance = undefined;
  if (!host.value || disposed) return;
  mode.value = "loading";
  try {
    if (!navigator.gpu) throw new Error(t("charts.noGpu"));
    const mount = document.createElement("div");
    mount.style.width = "100%";
    mount.style.height = "100%";
    host.value.replaceChildren(mount);
    const chart = await ChartGPU.create(mount, {
      theme: preferences.dark ? "dark" : "light",
      tooltip: { show: true },
      legend: { show: false },
      dataZoom: [{ type: "inside" }],
      series: props.series.map((s) => ({
        name: s.name,
        type: props.type,
        color: s.color,
        data: s.data,
      })),
    });
    if (disposed || ticket !== revision) {
      chart.dispose();
      return;
    }
    instance = chart;
    mode.value = "gpu";
    emit("ready", "gpu");
  } catch (e) {
    if (ticket !== revision || disposed) return;
    mode.value = "fallback";
    message.value = e instanceof Error ? e.message : t("charts.initError");
    emit("ready", "fallback");
  }
}
onMounted(() => {
  render();
  observer = new ResizeObserver(() => instance?.resize());
  if (host.value) observer.observe(host.value);
});
watch(() => [props.series, props.type, preferences.dark], render);
onBeforeUnmount(() => {
  disposed = true;
  revision++;
  observer?.disconnect();
  instance?.dispose();
});
</script>
<template>
  <div class="relative" :style="{ height: `${height}px` }">
    <div
      ref="host"
      class="absolute inset-0"
      :class="mode === 'fallback' ? 'invisible' : ''"
      role="img"
      :aria-label="`${series.map((s) => s.name).join(', ')} ${type}`"
    />
    <div
      v-if="mode === 'loading'"
      class="absolute inset-0 flex items-center justify-center text-muted text-xs"
      role="status"
    >
      {{ t("charts.initializing") }}
    </div>
    <div v-if="mode === 'fallback'" class="absolute inset-0 flex flex-col">
      <svg
        viewBox="0 0 960 270"
        preserveAspectRatio="none"
        class="w-full flex-1 min-h-0"
        role="img"
        :aria-label="t('charts.previewLabel')"
      >
        <g stroke="currentColor" class="text-slate-100 dark:text-slate-800">
          <line
            v-for="y in [30, 80, 130, 180, 230]"
            :key="y"
            x1="40"
            :y1="y"
            x2="940"
            :y2="y"
            stroke-dasharray="4 6"
          />
        </g>
        <path
          v-for="p in paths"
          :key="p.name"
          :d="p.path"
          fill="none"
          :stroke="p.color"
          stroke-width="2.5"
          vector-effect="non-scaling-stroke"
        />
        <g fill="#94a3b8" font-size="12">
          <text x="40" y="265">{{ t("common.start") }}</text>
          <text x="890" y="265">{{ t("common.latest") }}</text>
        </g>
      </svg>
      <p class="text-10px text-muted mb-0 mt-1" :title="message">
        {{ t("charts.fallback") }}
      </p>
    </div>
  </div>
</template>
