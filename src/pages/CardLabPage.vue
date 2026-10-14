<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue';
import { SCard, SForm, SImage, SButton, STag, cardTypes, cardTextures, cardEffects, cardOrientations, cardHoverEffects } from 'sax-design-vue';
import type { CardType, CardTexture, CardEffect, CardOrientation, CardHoverEffect, FormItemConfig } from 'sax-design-vue';
import { t } from '@/i18n';
import PageHeading from '@/components/common/PageHeading.vue';
interface Config { type: CardType; texture: CardTexture; effect: CardEffect; orientation: CardOrientation; shape: 'rounded' | 'square'; hover: CardHoverEffect; loading: boolean; selectable: boolean }
const model = reactive<Config>({ type: 'classic', texture: 'default', effect: 'default', orientation: 'vertical', shape: 'rounded', hover: 'lift', loading: false, selectable: true }), selected = shallowRef(false);
type Token = typeof cardTypes[number] | typeof cardTextures[number] | typeof cardEffects[number] | typeof cardOrientations[number] | typeof cardHoverEffects[number] | 'rounded' | 'square';
const options = (values: readonly Token[]) => values.map((value) => ({ value, label: t(`visual.${value}`) }));
const items = computed<FormItemConfig<Config>[]>(() => [
  { field: 'type', title: t('cardLab.type'), itemRender: { name: '$select', options: options(cardTypes) } }, { field: 'texture', title: t('cardLab.texture'), itemRender: { name: '$select', options: options(cardTextures) } },
  { field: 'effect', title: t('cardLab.effect'), itemRender: { name: '$select', options: options(cardEffects) } }, { field: 'orientation', title: t('cardLab.orientation'), itemRender: { name: '$select', options: options(cardOrientations) } },
  { field: 'shape', title: t('cardLab.shape'), itemRender: { name: '$select', options: options(['rounded', 'square']) } }, { field: 'hover', title: t('cardLab.hover'), itemRender: { name: '$select', options: options(cardHoverEffects) } },
  { field: 'loading', title: t('cardLab.loading'), itemRender: { name: '$switch' } }, { field: 'selectable', title: t('cardLab.selectable'), itemRender: { name: '$switch' } },
]);
</script>
<template><div class="feature-page">
  <PageHeading :title="t('nav.cardLab')" :caption="t('cardLab.caption')" eyebrow="MATERIALS" />
  <div class="grid grid-cols-1 xl:grid-cols-[minmax(240px,320px)_minmax(0,1fr)] gap-5">
    <SCard class="admin-card" :title="t('cardLab.controls')"><SForm :model="model" :items="items" label-position="top" :column-gap="0" /></SCard>
    <div class="lab-stage relative grid place-items-center p-8 rounded-5 overflow-hidden min-h-125"><span class="lab-backdrop" aria-hidden="true">SAX<br />DESIGN</span><SCard class="lab-preview" v-model:selected="selected" :type="model.type" :texture="model.texture" :effect="model.effect" :orientation="model.orientation" :shape="model.shape" :hover-effect="model.hover" :loading="model.loading" :selectable="model.selectable" :title="t('cardLab.title')" :text="t('cardLab.text')">
      <template #img><SImage src="/media-orbit.svg" width="100%" :height="190" :alt="t('files.art', { id: 3 })" fit="cover" /></template>
      <STag>{{ t('cardLab.selected', { value: selected ? '✓' : '—' }) }}</STag><template #buttons><SButton size="small" type="flat" @click.stop="selected = !selected">{{ t('cardLab.selectable') }}</SButton></template>
    </SCard></div>
  </div>
</div></template>
<style scoped>
.lab-stage { background: radial-gradient(circle at 15% 15%, #38bdf8, transparent 42%), radial-gradient(circle at 85% 80%, #a78bfa, transparent 44%), repeating-linear-gradient(120deg, #dbeafe 0 28px, #eef2ff 28px 56px); }
.lab-backdrop { position: absolute; font-size: clamp(50px, 8vw, 100px); line-height: 1.25; font-weight: 800; color: #4f46e5; opacity: .45; transform: rotate(-14deg); }
.lab-stage :deep(.s-card-content) { width: min(100%, 520px); position: relative; }
.lab-preview.s-card { width: 100%; max-width: none; }
</style>
