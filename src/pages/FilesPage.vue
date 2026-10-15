<script setup lang="ts">
const baseUrl = import.meta.env.BASE_URL;
import { computed, shallowRef } from 'vue';
import { SCard, SImage, SUpload, SButton, STag, SAlert, STable, SWatermark, UploadPickError } from 'sax-design-vue';
import type { TableColumn } from 'sax-design-vue';
import { t } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
const images = ['media-workspace.svg', 'media-analytics.svg', 'media-orbit.svg'].map(name => `${baseUrl}${name}`);
const queue = shallowRef<File[]>([]), picked = shallowRef<File[]>([]), error = shallowRef('');
interface PickedFile { id: number; name: string; size: string; type: string }
const rows = computed<PickedFile[]>(() => picked.value.map((file, id) => ({ id, name: file.name, size: `${(file.size / 1024).toFixed(1)} KB`, type: file.type || '—' })));
const columns = computed<TableColumn<PickedFile>[]>(() => [{ field: 'name', title: t('business.name'), minWidth: 200 }, { field: 'size', title: 'KB', width: 130 }, { field: 'type', title: 'MIME', minWidth: 160 }]);
async function pick() { error.value = ''; try { const files = await SUpload.pick({ multiple: true, accept: ['image/*', '.pdf'], limit: 5, limitSize: 5 }); if (files) picked.value = files; } catch (cause) { error.value = t(cause instanceof UploadPickError ? cause.reason === 'size' ? 'files.errorSize' : cause.reason === 'limit' ? 'files.errorLimit' : cause.reason === 'type' ? 'files.errorType' : 'files.errorPick' : 'files.errorPick'); } }
</script>
<template><div class="feature-page">
  <PageHeading :title="t('nav.files')" :caption="t('files.caption')" eyebrow="ASSETS" />
  <div class="grid gap-5">
    <SCard class="admin-card" :title="t('files.gallery')" :subtitle="t('files.galleryCaption')"><div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5"><SImage v-for="(src, index) in images" :key="src" :src="src" width="100%" :aspect-ratio="1.6" fit="cover" :alt="t('files.art', { id: index + 1 })" preview :preview-src-list="images" :initial-index="index" /></div></SCard>
    <SCard class="admin-card" :title="t('files.queue')" :subtitle="t('files.queueCaption')"><SUpload v-model="queue" multiple accept="image/*,.pdf" :limit-count="5" :limit-size="5" :automatic="false" :show-submit-button="false" list-type="card" /></SCard>
    <SCard class="admin-card" :title="t('files.pick')" :subtitle="t('files.pickCaption')"><div class="flex gap-3 items-center py-5"><SButton @click="pick">{{ t('files.choose') }}</SButton><STag>{{ t('files.picked', { count: picked.length }) }}</STag></div><SAlert v-if="error" color="danger">{{ error }}</SAlert><STable v-if="picked.length" :data="rows" :columns="columns" row-key="id" /></SCard>
    <SCard class="admin-card" :title="t('files.watermark')"><SWatermark content="Adoin Wang · Sax Admin"><SImage :src="`${baseUrl}media-analytics.svg`" width="100%" :height="220" fit="cover" :alt="t('files.art', { id: 2 })" /></SWatermark></SCard>
  </div>
</div></template>
