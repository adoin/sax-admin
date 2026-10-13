import { computed } from "vue";
import { t, departmentLabel } from "@/i18n";
import type { FormItemConfig, SaxGridSetting } from "sax-design-vue";
import { usersApi } from "@/api";
import type { User, UserInput } from "@/api/contracts";
export interface UserFilters {
  keyword: string;
  status: string;
}
export const roleOptions = computed(() => [
  { label: t("role.admin"), value: "admin" },
  { label: t("role.editor"), value: "editor" },
  { label: t("role.viewer"), value: "viewer" },
]);
export const statusOptions = computed(() => [
  { label: t("status.active"), value: "active" },
  { label: t("status.disabled"), value: "disabled" },
]);
export const departmentOptions = computed(() =>
  ["design", "engineering", "marketing", "success"].map((value) => ({
    label: departmentLabel(value),
    value,
  })),
);
export function createUsersConfig(
  model: UserFilters,
): SaxGridSetting<User, UserFilters> {
  return {
    rowKey: "id",
    size: "default",
    columns: [
      {
        field: "name",
        title: t("users.member"),
        minWidth: 220,
        slots: { default: "member" },
      },
      {
        field: "department",
        title: t("users.department"),
        minWidth: 125,
        slots: { default: "department" },
      },
      {
        field: "role",
        title: t("users.role"),
        minWidth: 110,
        slots: { default: "role" },
      },
      {
        field: "status",
        title: t("users.status"),
        minWidth: 95,
        slots: { default: "status" },
      },
      { field: "createdAt", title: t("users.joined"), minWidth: 125 },
      {
        key: "actions",
        title: t("users.actions"),
        width: 125,
        fixed: "right",
        slots: { default: "actions" },
      },
    ],
    queryConfig: {
      model,
      labelPosition: "top",
      submitText: t("users.query"),
      resetText: t("users.reset"),
      items: [
        {
          field: "keyword",
          title: t("users.search"),
          span: 12,
          itemRender: {
            name: "$input",
            props: {
              placeholder: t("users.searchPlaceholder"),
              clearable: true,
            },
          },
        },
        {
          field: "status",
          title: t("users.statusFilter"),
          span: 12,
          itemRender: {
            name: "$select",
            props: { placeholder: t("users.allStatus"), clearable: true },
            options: statusOptions.value,
          },
        },
      ],
    },
    toolbarConfig: { title: t("users.all") },
    pagerConfig: {
      currentPage: 1,
      pageSize: 10,
      remote: true,
      pageSizes: [10, 20, 50],
    },
    proxyConfig: {
      autoLoad: true,
      autoQuery: true,
      query: async ({ form, pager, signal }) => {
        const method = usersApi.list({
          ...form,
          page: pager ? pager.currentPage || 1 : 1,
          pageSize: pager ? pager.pageSize || 10 : 10,
        });
        const abort = () => method.abort();
        signal.addEventListener("abort", abort, { once: true });
        try {
          const result = await method;
          return { data: result.items, total: result.total };
        } finally {
          signal.removeEventListener("abort", abort);
        }
      },
    },
  };
}
export const userFormItems = computed<FormItemConfig<UserInput>[]>(() => [
  {
    field: "name",
    title: t("users.name"),
    required: true,
    rules: [{ required: true, message: t("users.nameRequired") }],
    itemRender: {
      name: "$input",
      props: { placeholder: t("users.namePlaceholder") },
    },
  },
  {
    field: "email",
    title: t("users.email"),
    required: true,
    rules: [
      { required: true, message: t("users.emailRequired") },
      {
        validator: (value) =>
          (typeof value === "string" &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ||
          t("users.emailInvalid"),
      },
    ],
    itemRender: { name: "$input", props: { placeholder: "name@example.com" } },
  },
  {
    field: "department",
    title: t("users.departmentLabel"),
    required: true,
    rules: [{ required: true, message: t("users.departmentRequired") }],
    itemRender: { name: "$select", options: departmentOptions.value },
  },
  {
    field: "role",
    title: t("users.role"),
    itemRender: { name: "$select", options: roleOptions.value },
  },
  {
    field: "status",
    title: t("users.status"),
    itemRender: { name: "$select", options: statusOptions.value },
  },
]);
