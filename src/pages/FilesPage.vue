<script setup lang="ts">
import { computed, shallowRef } from "vue";
import {
  SCard,
  SImage,
  SFileManager,
  SImagePreview,
  SUpload,
  SButton,
  STag,
  SAlert,
  STable,
  SWatermark,
  UploadPickError,
} from "sax-design-vue";
import type { FileManagerEntry, TableColumn } from "sax-design-vue";
import { t } from "@/i18n";
import PageHeading from "@/components/common/PageHeading.vue";
const baseUrl = import.meta.env.BASE_URL;
const images = [
  "media-workspace.svg",
  "media-analytics.svg",
  "media-orbit.svg",
].map((name) => `${baseUrl}${name}`);
const directoryId = shallowRef<string | number | null>(null);
const entries = shallowRef<FileManagerEntry[]>([
  { id: "media", parentId: null, kind: "folder", name: "Media" },
  { id: "documents", parentId: null, kind: "folder", name: "Documents" },
  { id: "archive", parentId: "documents", kind: "folder", name: "Archive" },
  ...images.map((url, index): FileManagerEntry => ({
    id: `image-${index}`,
    parentId: "media",
    kind: "file",
    name: ["workspace.svg", "analytics.svg", "orbit.svg"][index]!,
    thumbnail: url,
    mimeType: "image/svg+xml",
    size: (index + 1) * 2048,
  })),
  {
    id: "readme",
    parentId: "documents",
    kind: "file",
    name: "README.md",
    size: 2048,
  },
  {
    id: "report",
    parentId: "documents",
    kind: "file",
    name: "report.pdf",
    size: 248320,
  },
  {
    id: "settings",
    parentId: "archive",
    kind: "file",
    name: "settings.json",
    size: 1024,
  },
]);
const previewVisible = shallowRef(false),
  previewUrls = shallowRef<string[]>([]),
  previewNames = shallowRef<string[]>([]),
  previewIndex = shallowRef(0),
  openNotice = shallowRef("");
function openEntry(entry: FileManagerEntry) {
  if (!entry.mimeType?.startsWith("image/") || !entry.thumbnail) {
    openNotice.value = t("files.noViewer", { name: entry.name });
    return;
  }
  const siblings = entries.value.filter(
    (item) =>
      item.kind === "file" &&
      item.parentId === entry.parentId &&
      item.mimeType?.startsWith("image/") &&
      item.thumbnail,
  );
  previewUrls.value = siblings.map((item) => item.thumbnail!);
  previewNames.value = siblings.map((item) => item.name);
  previewIndex.value = siblings.findIndex((item) => item.id === entry.id);
  openNotice.value = "";
  previewVisible.value = true;
}
const queue = shallowRef<File[]>([]),
  picked = shallowRef<File[]>([]),
  error = shallowRef("");
interface PickedFile {
  id: number;
  name: string;
  size: string;
  type: string;
}
const rows = computed<PickedFile[]>(() =>
  picked.value.map((file, id) => ({
    id,
    name: file.name,
    size: `${(file.size / 1024).toFixed(1)} KB`,
    type: file.type || "—",
  })),
);
const columns = computed<TableColumn<PickedFile>[]>(() => [
  { field: "name", title: t("business.name"), minWidth: 200 },
  { field: "size", title: "KB", width: 130 },
  { field: "type", title: "MIME", minWidth: 160 },
]);
async function pick() {
  error.value = "";
  try {
    const files = await SUpload.pick({
      multiple: true,
      accept: ["image/*", ".pdf"],
      limit: 5,
      limitSize: 5,
    });
    if (files) picked.value = files;
  } catch (cause) {
    error.value = t(
      cause instanceof UploadPickError
        ? cause.reason === "size"
          ? "files.errorSize"
          : cause.reason === "limit"
            ? "files.errorLimit"
            : cause.reason === "type"
              ? "files.errorType"
              : "files.errorPick"
        : "files.errorPick",
    );
  }
}
</script>
<template>
  <div class="feature-page">
    <PageHeading
      :title="t('nav.files')"
      :caption="t('files.caption')"
      eyebrow="ASSETS"
    />
    <div class="grid gap-5">
      <SCard
        class="admin-card"
        :title="t('files.manager')"
        :subtitle="t('files.managerCaption')"
      >
        <SFileManager
          v-model="entries"
          v-model:directory-id="directoryId"
          :height="560"
          tree-show-files
          @open="openEntry"
        />
        <SAlert v-if="openNotice" color="primary">{{ openNotice }}</SAlert>
      </SCard>
      <SImagePreview
        v-model="previewVisible"
        :url-list="previewUrls"
        :alt-list="previewNames"
        :initial-index="previewIndex"
      />
      <SCard
        class="admin-card"
        :title="t('files.queue')"
        :subtitle="t('files.queueCaption')"
        ><SUpload
          v-model="queue"
          multiple
          accept="image/*,.pdf"
          :limit-count="5"
          :limit-size="5"
          :automatic="false"
          :show-submit-button="false"
          list-type="card"
      /></SCard>
      <SCard
        class="admin-card"
        :title="t('files.pick')"
        :subtitle="t('files.pickCaption')"
        ><div class="flex gap-3 items-center py-5">
          <SButton @click="pick">{{ t("files.choose") }}</SButton
          ><STag>{{ t("files.picked", { count: picked.length }) }}</STag>
        </div>
        <SAlert v-if="error" color="danger">{{ error }}</SAlert
        ><STable
          v-if="picked.length"
          :data="rows"
          :columns="columns"
          row-key="id"
      /></SCard>
      <SCard class="admin-card" :title="t('files.watermark')"
        ><SWatermark content="Adoin Wang · Sax Admin"
          ><SImage
            :src="`${baseUrl}media-analytics.svg`"
            width="100%"
            :height="220"
            fit="cover"
            :alt="t('files.art', { id: 2 })" /></SWatermark
      ></SCard>
    </div>
  </div>
</template>
