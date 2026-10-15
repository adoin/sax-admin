<script setup lang="ts">
import { useRemainingHeight } from '@/composables/useRemainingHeight';
import type { ComponentPublicInstance } from 'vue';
import { computed, reactive, shallowRef } from "vue";
import { SCard, STable, SButton, STag, SDialog, SSteps } from "sax-design-vue";
import type { SaxGridSetting, TableExposes } from "sax-design-vue";
import { ordersApi } from "@/api";
import type { Order, OrderStatus, OrderItem } from "@/api/contracts";
import { t } from "@/i18n";
import PageHeading from "@/components/common/PageHeading.vue";
const tableCard = shallowRef<ComponentPublicInstance>();
const { style: tableCardStyle } = useRemainingHeight(tableCard);

const filters = reactive({ keyword: "", status: "" }),
  table = shallowRef<TableExposes<Order, typeof filters>>(),
  detail = shallowRef<Order | null>(null);
const statuses: OrderStatus[] = ["pending", "paid", "shipped", "completed"];
function statusLabel(status: OrderStatus) {
  return t(`orders.${status}`);
}
const config = computed<SaxGridSetting<Order, typeof filters>>(() => ({
  rowKey: "id",
  columns: [
    { field: "number", title: t("orders.number"), minWidth: 190 },
    { field: "customer", title: t("orders.customer"), minWidth: 120 },
    {
      field: "total",
      title: t("orders.total"),
      minWidth: 140,
      sortable: true,
      slots: { default: "amount" },
    },
    {
      field: "status",
      title: t("orders.status"),
      minWidth: 130,
      slots: { default: "status" },
    },
    { field: "date", title: t("orders.date"), minWidth: 120 },
    {
      key: "actions",
      title: t("users.actions"),
      width: 130,
      slots: { default: "actions" },
    },
  ],
  queryConfig: {
    model: filters,
    submitText: t("users.query"),
    resetText: t("users.reset"),
    items: [
      {
        field: "keyword",
        span: 12,
        itemRender: {
          name: "$input",
          props: { clearable: true, label: t("orders.keyword"), labelFloat: true },
        },
      },
      {
        field: "status",
        span: 12,
        itemRender: {
          name: "$select",
          props: { clearable: true, placeholder: t("users.allStatus"), label: t("orders.status"), labelFloat: true },
          options: statuses.map((value) => ({
            value,
            label: t(`orders.${value}`),
          })),
        },
      },
    ],
  },
  toolbarConfig: { title: t("orders.all") },
  pagerConfig: { pageSize: 10, currentPage: 1, remote: true },
  proxyConfig: {
    autoLoad: true,
    autoQuery: true,
    query: async ({ form, pager, signal }) => {
      const method = ordersApi.list({
        ...form,
        page: pager ? pager.currentPage || 1 : 1,
        pageSize: pager ? pager.pageSize || 10 : 10,
      });
      const abort = () => method.abort();
      signal.addEventListener("abort", abort, { once: true });
      try {
        const data = await method;
        return { data: data.items, total: data.total };
      } finally {
        signal.removeEventListener("abort", abort);
      }
    },
  },
}));
const itemColumns = computed<SaxGridSetting<OrderItem>["columns"]>(() => [
  { field: "name", title: t("orders.product") },
  { field: "quantity", title: t("orders.quantity"), width: 90 },
  { field: "price", title: t("orders.price"), slots: { default: "price" } },
]);
const steps = computed(() =>
  ["orders.created", "orders.payment", "orders.delivery", "orders.done"].map(
    (key) => ({ title: t(key as "orders.created") }),
  ),
);
</script>
<template>
  <PageHeading
    :title="t('nav.orders')"
    :caption="t('orders.caption')"
    eyebrow="COMMERCE"
  /><SCard ref="tableCard" class="admin-card remaining-height-card" :style="tableCardStyle"
    ><STable :virtual-config="{ enabled: true, height: 'auto' }" ref="table" v-bind="config"
      ><template #toolbar_right
        ><SButton type="flat" size="small" @click="table?.refresh()">{{
          t("common.refresh")
        }}</SButton></template
      ><template #amount="{ row }"
        ><span class="tabular"
          >¥{{ row.total.toLocaleString() }}</span
        ></template
      ><template #status="{ row }"
        ><STag
          :color="
            row.status === 'completed'
              ? 'success'
              : row.status === 'pending'
                ? 'warn'
                : 'primary'
          "
          >{{ statusLabel(row.status) }}</STag
        ></template
      ><template #actions="{ row }"
        ><SButton type="flat" size="small" @click="detail = row">{{
          t("orders.detail")
        }}</SButton></template
      ></STable
    ></SCard
  ><SDialog
    :model-value="Boolean(detail)"
    :title="detail?.number"
    width="760px"
    @update:model-value="
      (v) => {
        if (!v) detail = null;
      }
    "
    ><template v-if="detail"
      ><div class="flex flex-wrap justify-between gap-3 mb-6">
        <span>{{ t("orders.customer") }}: {{ detail.customer }}</span
        ><STag>{{ t(`orders.${detail.status}`) }}</STag>
      </div>
      <h3 class="section-title">{{ t("orders.flow") }}</h3>
      <SSteps
        :items="steps"
        :active="statuses.indexOf(detail.status)"
        class="mb-7"
      />
      <h3 class="section-title">{{ t("orders.products") }}</h3>
      <STable :data="detail.items" :columns="itemColumns"
        ><template #price="{ row }"
          >¥{{ row.price.toLocaleString() }}</template
        ></STable
      >
      <p class="text-right font-700 text-xl mt-6">
        {{ t("orders.total") }}: ¥{{ detail.total.toLocaleString() }}
      </p></template
    ></SDialog
  >
</template>
