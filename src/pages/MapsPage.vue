<script setup lang="ts">
import { SCard } from "sax-design-vue";
import { t, cityLabel } from "@/i18n";
import { computed, onMounted, shallowRef } from "vue";
import { SButton, SSwitch, STable } from "sax-design-vue";
import {
  RefreshCw,
  LocateFixed,
  MapPin,
  Route,
  Building2,
} from "lucide-vue-next";
import { dashboardApi } from "@/api";
import type { MapData, MapPoint } from "@/api/contracts";
import type { SaxGridSetting } from "sax-design-vue";
import PageHeading from "@/components/common/PageHeading.vue";
import BusinessMap from "@/components/maps/BusinessMap.vue";
const data = shallowRef<MapData>(),
  busy = shallowRef(false),
  error = shallowRef(""),
  flows = shallowRef(true),
  labels = shallowRef(true),
  map = shallowRef<InstanceType<typeof BusinessMap>>();
const total = computed(
  () => data.value?.points.reduce((sum, p) => sum + p.value, 0) || 0,
);
const ranking = computed(() =>
  [...(data.value?.points || [])].sort((a, b) => b.value - a.value),
);
const columns = computed<SaxGridSetting<MapPoint>["columns"]>(() => [
  {
    field: "name",
    title: t("maps.city"),
    minWidth: 100,
    slots: { default: "city" },
  },
  { field: "value", title: t("maps.volume"), minWidth: 100, sortable: true },
  {
    field: "position",
    title: t("maps.coordinates"),
    minWidth: 160,
    slots: { default: "coordinates" },
  },
]);
async function refresh() {
  busy.value = true;
  error.value = "";
  try {
    data.value = await dashboardApi.map();
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
    :title="t('maps.title')"
    :caption="t('maps.caption')"
    eyebrow="GEOGRAPHIC"
    ><SButton type="flat" :loading="busy" @click="refresh"
      ><RefreshCw :size="15" class="mr-2" />{{ t("common.refresh") }}</SButton
    ></PageHeading
  >
  <div class="grid sm:grid-cols-3 gap-5 mb-5">
    <div
      v-for="item in [
        {
          label: t('maps.cities'),
          value: data?.points.length || 0,
          icon: Building2,
        },
        {
          label: t('maps.volume'),
          value: total.toLocaleString(),
          icon: MapPin,
        },
        {
          label: t('maps.routes'),
          value: data?.flows.length || 0,
          icon: Route,
        },
      ]"
      :key="item.label"
      class=""
    >
      <SCard class="admin-card card-inline">
        <span class="text-brand p-3 rounded-3 bg-blue-50"
          ><component :is="item.icon" :size="21"
        /></span>
        <div>
          <p class="text-muted text-xs m-0">{{ item.label }}</p>
          <b class="text-7 tabular mt-1 block">{{ item.value }}</b>
        </div>
      </SCard>
    </div>
  </div>
  <section class="">
    <SCard class="admin-card">
      <div class="flex flex-wrap justify-between items-center mb-5 gap-4">
        <div>
          <h2 class="section-title m-0">{{ t("maps.network") }}</h2>
          <p class="text-xs text-muted mt-2 mb-0">
            {{ t("maps.instructions") }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-5">
          <label class="text-12px text-muted flex items-center gap-2"
            >{{ t("maps.flows")
            }}<SSwitch
              v-model="flows"
              :aria-label="t('maps.showFlows')" /></label
          ><label class="text-12px text-muted flex items-center gap-2"
            >{{ t("maps.labels")
            }}<SSwitch
              v-model="labels"
              :aria-label="t('maps.showLabels')" /></label
          ><SButton type="flat" size="small" @click="map?.reset()"
            ><LocateFixed :size="14" class="mr-1.5" />{{
              t("maps.reset")
            }}</SButton
          >
        </div>
      </div>
      <p v-if="error" role="alert" class="text-red-600">{{ error }}</p>
      <p
        v-if="busy && !data"
        class="py-20 text-center text-muted"
        role="status"
      >
        {{ t("maps.loading") }}
      </p>
      <BusinessMap
        v-if="data"
        ref="map"
        :data="data"
        :flows="flows"
        :labels="labels"
      />
    </SCard>
  </section>
  <section v-if="data" class="mt-5">
    <SCard class="admin-card">
      <h2 class="section-title m-0 mb-5">{{ t("maps.ranking") }}</h2>
      <STable
        :data="ranking"
        :columns="columns"
        row-key="id"
        :pager-config="{ pageSize: 6 }"
        ><template #city="{ row }">{{ cityLabel(row.name) }}</template
        ><template #coordinates="{ row }"
          ><span class="text-muted text-xs tabular"
            >{{ row.position[0].toFixed(2) }}° E,
            {{ row.position[1].toFixed(2) }}° N</span
          ></template
        ></STable
      >
    </SCard>
  </section>
</template>
