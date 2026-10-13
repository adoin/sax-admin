<script setup lang="ts">
import { t, cityLabel, locale } from "@/i18n";
import { onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { Deck, MapView } from "@deck.gl/core";
import {
  GeoJsonLayer,
  ScatterplotLayer,
  ArcLayer,
  TextLayer,
} from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type { MapData, MapPoint, MapFlow } from "@/api/contracts";
const props = defineProps<{ data: MapData; flows: boolean; labels: boolean }>();
const host = shallowRef<HTMLDivElement>(),
  error = shallowRef("");
let deck: Deck<MapView> | undefined;
function layers() {
  return [
    new GeoJsonLayer({
      id: "countries",
      data: "/geo/countries.geojson",
      filled: true,
      stroked: true,
      getFillColor: [30, 49, 76],
      getLineColor: [60, 84, 116],
      getLineWidth: 1,
      lineWidthUnits: "pixels",
      pickable: false,
    }),
    ...(props.flows
      ? [
          new ArcLayer<MapFlow>({
            id: "city-flows",
            data: props.data.flows,
            getSourcePosition: (d) => d.source,
            getTargetPosition: (d) => d.target,
            getSourceColor: [61, 132, 255, 200],
            getTargetColor: [39, 214, 180, 200],
            getWidth: (d) => Math.max(1, d.value / 130),
            pickable: true,
          }),
        ]
      : []),
    new ScatterplotLayer<MapPoint>({
      id: "city-points",
      data: props.data.points,
      getPosition: (d) => d.position,
      getRadius: (d) => Math.sqrt(d.value) * 2200,
      radiusMinPixels: 5,
      radiusMaxPixels: 24,
      getFillColor: [57, 144, 255, 150],
      stroked: true,
      getLineColor: [123, 186, 255],
      getLineWidth: 1,
      lineWidthUnits: "pixels",
      pickable: true,
    }),
    ...(props.labels
      ? [
          new TextLayer<MapPoint>({
            id: "city-labels",
            data: props.data.points,
            getPosition: (d) => d.position,
            getText: (d) => cityLabel(d.name),
            getSize: 12,
            getColor: [219, 233, 255],
            getPixelOffset: [0, 21],
            parameters: { depthCompare: "always", depthWriteEnabled: false },
            updateTriggers: { getText: locale.value },
            fontFamily: "Microsoft YaHei, sans-serif",
            characterSet: "auto",
            getTextAnchor: "middle",
            getAlignmentBaseline: "top",
          }),
        ]
      : []),
  ];
}
function reset() {
  deck?.setProps({
    initialViewState: {
      longitude: 111.5,
      latitude: 32,
      zoom: 3.7,
      pitch: 25,
      bearing: 0,
    },
  });
}
defineExpose({ reset });
onMounted(() => {
  if (!host.value) return;
  try {
    deck = new Deck({
      parent: host.value,
      views: new MapView({ repeat: true }),
      initialViewState: {
        longitude: 111.5,
        latitude: 32,
        zoom: 3.7,
        pitch: 25,
        bearing: 0,
      },
      controller: true,
      layers: layers(),
      getTooltip: ({ object }: PickingInfo<MapPoint | MapFlow>) =>
        object
          ? {
              text: `${object.name.split(" → ").map(cityLabel).join(" → ")}\n${t("maps.tooltip", { value: object.value.toLocaleString() })}`,
              style: {
                backgroundColor: "#111e36",
                color: "#fff",
                fontSize: "12px",
                borderRadius: "10px",
                padding: "12px",
              },
            }
          : null,
      onError: (e) => {
        error.value = e.message;
      },
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("maps.initError");
  }
});
watch(
  () => [props.data, props.flows, props.labels, locale.value],
  () => deck?.setProps({ layers: layers() }),
);
onBeforeUnmount(() => deck?.finalize());
</script>
<template>
  <div class="relative h-125 rounded-4 overflow-hidden bg-[#101c31]">
    <div
      ref="host"
      class="absolute inset-0"
      role="img"
      :aria-label="t('maps.mapLabel')"
    />
    <div class="absolute top-5 left-5 pointer-events-none">
      <span class="text-blue-300 text-10px tracking-widest"
        >BUSINESS NETWORK</span
      >
      <h3 class="text-white text-lg font-600 mt-2">{{ t("maps.connect") }}</h3>
    </div>
    <div
      class="absolute bottom-5 left-5 text-11px text-slate-400 pointer-events-none"
    >
      <span class="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2" />{{
        t("maps.cityVolume")
      }}<span v-if="flows" class="ml-5"
        ><span
          class="inline-block w-5 h-0.5 bg-emerald-400 mr-2 align-middle"
        />{{ t("maps.cityFlows") }}</span
      >
    </div>
    <span
      class="absolute bottom-3 right-4 text-9px text-slate-500 pointer-events-none"
      >Natural Earth · deck.gl</span
    >
    <div
      v-if="error"
      class="absolute inset-0 bg-[#101c31]/95 flex flex-col items-center justify-center text-slate-300 gap-3 px-8 text-center"
      role="alert"
    >
      <strong class="text-lg text-white">{{ t("maps.unavailable") }}</strong>
      <p class="text-xs max-w-100 leading-6">{{ error }}</p>
      <p class="text-xs">{{ t("maps.hardware") }}</p>
    </div>
  </div>
</template>
