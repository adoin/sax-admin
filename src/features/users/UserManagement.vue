<script setup lang="ts">
import { SCard } from "sax-design-vue";
import { t, departmentLabel, messageLabel } from "@/i18n";
import { shallowRef, reactive, computed } from "vue";
import { STable, SButton, STag, SDialog } from "sax-design-vue";
import type { TableExposes } from "sax-design-vue";
import { Plus, RefreshCw, Pencil, Trash2, Download } from "lucide-vue-next";
import PageHeading from "@/components/common/PageHeading.vue";
import UserEditor from "./UserEditor.vue";
import { createUsersConfig, roleOptions } from "./config";
import type { UserFilters } from "./config";
import { sessionStore } from "@/stores/session";
import { usersApi } from "@/api";
import type { User, UserInput } from "@/api/contracts";
const filters = reactive<UserFilters>({ keyword: "", status: "" });
const config = computed(() => createUsersConfig(filters)),
  session = sessionStore(),
  table = shallowRef<TableExposes<User, UserFilters>>();
const editing = shallowRef<User | null>(null),
  open = shallowRef(false),
  busy = shallowRef(false),
  error = shallowRef(""),
  removing = shallowRef<User | null>(null),
  notice = shallowRef("");
function edit(user: User | null) {
  editing.value = user;
  error.value = "";
  open.value = true;
}
async function save(input: UserInput) {
  busy.value = true;
  error.value = "";
  try {
    if (editing.value) await usersApi.update(editing.value.id, input);
    else await usersApi.create(input);
    open.value = false;
    notice.value = "users.saved";
    await table.value?.refresh();
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("error.save");
  } finally {
    busy.value = false;
  }
}
async function remove() {
  if (!removing.value || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    await usersApi.remove(removing.value.id);
    removing.value = null;
    notice.value = "users.deleted";
    await table.value?.refresh();
  } catch (e) {
    error.value = e instanceof Error ? e.message : t("error.delete");
  } finally {
    busy.value = false;
  }
}
async function exportCsv() {
  busy.value = true;
  try {
    const result = await usersApi.list({
      keyword: "",
      status: "",
      page: 1,
      pageSize: 100,
    });
    const esc = (s: string) => `"${s.replaceAll('"', '""')}"`;
    const csv =
      "\uFEFF" +
      [
        t("users.name"),
        t("users.email"),
        t("users.department"),
        t("users.role"),
        t("users.status"),
      ]
        .map(esc)
        .join(",") +
      "\n" +
      result.items
        .map((u) =>
          [
            u.name,
            u.email,
            departmentLabel(u.department),
            t(`role.${u.role}`),
            t(`status.${u.status}`),
          ]
            .map(esc)
            .join(","),
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "members-first-100.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notice.value = "users.exported";
  } catch (e) {
    notice.value = e instanceof Error ? e.message : t("error.export");
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <PageHeading
    :title="t('nav.users')"
    :caption="t('users.caption')"
    eyebrow="TEAM"
    ><SButton type="flat" :loading="busy" @click="exportCsv"
      ><Download :size="15" class="mr-2" />{{ t("users.export") }}</SButton
    ><SButton v-if="session.isAdmin" @click="edit(null)"
      ><Plus :size="16" class="mr-1.5" />{{ t("users.add") }}</SButton
    ></PageHeading
  >
  <p v-if="notice" role="status" class="text-emerald-600 text-sm">
    {{ messageLabel(notice) }}
  </p>
  <p v-if="!session.isAdmin" class="text-muted text-sm mb-5">
    {{ t("users.readonly") }}
  </p>
  <div class="min-w-0">
    <SCard class="admin-card">
      <STable ref="table" v-bind="config"
        ><template #toolbar_right
          ><SButton type="flat" size="small" @click="table?.refresh()"
            ><RefreshCw :size="14" class="mr-1" />{{
              t("common.refresh")
            }}</SButton
          ></template
        ><template #member="{ row }"
          ><div class="flex items-center gap-3 py-1.5">
            <span
              class="w-9 h-9 bg-blue-50 text-blue-600 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs shrink-0"
              >{{ row.name.slice(-2) }}</span
            >
            <div>
              <span class="text-13px font-550">{{ row.name }}</span
              ><span class="block text-11px text-muted mt-1">{{
                row.email
              }}</span>
            </div>
          </div></template
        ><template #department="{ row }">{{
          departmentLabel(row.department)
        }}</template
        ><template #role="{ row }"
          ><STag
            variant="default"
            :color="
              row.role === 'admin'
                ? 'primary'
                : row.role === 'editor'
                  ? '#8b5cf6'
                  : '#64748b'
            "
            >{{ roleOptions.find((r) => r.value === row.role)?.label }}</STag
          ></template
        ><template #status="{ row }"
          ><span
            class="text-12px flex items-center gap-2"
            :class="row.status === 'active' ? 'text-emerald-600' : 'text-muted'"
            ><span
              class="w-1.5 h-1.5 rounded-full"
              :class="
                row.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
              "
            />{{
              row.status === "active"
                ? t("status.active")
                : t("status.disabled")
            }}</span
          ></template
        ><template #actions="{ row }"
          ><div v-if="session.isAdmin" class="flex gap-1">
            <SButton
              type="transparent"
              icon
              size="small"
              :aria-label="t('users.edit', { name: row.name })"
              @click="edit(row)"
              ><Pencil :size="15" /></SButton
            ><SButton
              type="transparent"
              icon
              color="danger"
              size="small"
              :aria-label="t('users.delete', { name: row.name })"
              @click="
                removing = row;
                error = '';
              "
              ><Trash2 :size="15"
            /></SButton>
          </div>
          <span v-else class="text-muted text-xs">{{
            t("users.readonlyAction")
          }}</span></template
        ></STable
      >
    </SCard>
  </div>
  <UserEditor
    v-model:open="open"
    :user="editing"
    :busy="busy"
    :error="error"
    @save="save"
  /><SDialog
    :model-value="Boolean(removing)"
    :title="t('users.deleteTitle')"
    width="430px"
    @update:model-value="
      (value) => {
        if (!value && !busy) removing = null;
      }
    "
    ><p class="text-sm leading-7">
      {{ t("users.deleteConfirm", { name: removing?.name || "" }) }}
    </p>
    <p v-if="error" role="alert" class="text-red-600">{{ error }}</p>
    <template #footer
      ><div class="flex justify-end gap-3">
        <SButton type="flat" :disabled="busy" @click="removing = null">{{
          t("common.cancel")
        }}</SButton
        ><SButton color="danger" :loading="busy" @click="remove">{{
          t("users.deleteAction")
        }}</SButton>
      </div></template
    ></SDialog
  >
</template>
