<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { SIcon, SCard, SSelect, SButton, STag, SAlert } from 'sax-design-vue';
import { getIconData } from 'sax-design-vue-iconify';
import PageHeading from '@/components/common/PageHeading.vue';
import { iconBuildProbe } from '@/icons/tree-shaking-proof';
import { t } from '@/i18n';
const selected = shallowRef('demo:house');
const registered = shallowRef(Boolean(getIconData('custom:brand-mark')));
const busy = shallowRef(false);
const missing = 'custom:not-registered', runtimeName = 'custom:brand-mark';
const localConfig = `defineSaxIconConfig({
  mode: 'local',
  collections: { demo: 'lucide' },
  safelist: ['demo:house']
})`;
const apiConfig = `defineSaxIconConfig({
  mode: 'api',
  collections: { demo: 'lucide' },
  api: { baseUrl: 'http://icons.intranet:3000/' },
  safelist: ['demo:house']
})`;
const svgConfig = `addIconData('custom:mark', {
  attributes: { viewBox: '0 0 24 24' },
  body: '<path d="M4 12h16" fill="none" stroke="currentColor"/>'
})`;
const options = computed(() => [
  { label: t('icons.house'), value: 'demo:house' },
  { label: t('icons.settings'), value: 'demo:settings' },
  { label: t('icons.analytics'), value: 'demo:chart-no-axes-combined' },
]);
async function register() {
  busy.value = true;
  try { (await import('@/icons/runtime-brand')).registerBrandIcon(); registered.value = true; }
  finally { busy.value = false; }
}
</script>
<template>
  <PageHeading :title="t('nav.icons')" :caption="t('icons.caption')" eyebrow="ICONS" />
  <div class="icon-examples">
    <SCard class="admin-card" :title="t('icons.static')" :subtitle="t('icons.staticCaption')">
      <div class="icon-row">
        <div class="icon-sample"><SIcon name="demo:rocket" :size="40" color="primary" :label="t('icons.rocket')" /><span>{{ t('icons.rocket') }}</span></div>
        <div class="icon-sample"><SIcon name="demo:badge-check" :size="40" color="success" :label="t('icons.verified')" /><span>{{ t('icons.verified') }}</span></div>
        <div class="icon-sample"><SIcon :icon-data="iconBuildProbe" :size="40" :rotate="45" color="warning" :label="t('icons.explicit')" /><span>{{ t('icons.explicit') }}</span></div>
      </div>
    </SCard>
    <SCard class="admin-card" :title="t('icons.dynamic')" :subtitle="t('icons.dynamicCaption')">
      <div class="icon-row"><SSelect v-model="selected" :options="options" :aria-label="t('icons.select')" /><SIcon :name="selected" :size="48" color="primary" :label="t('icons.select')" /><code>{{ selected }}</code></div>
    </SCard>
    <SCard class="admin-card" :title="t('icons.runtime')" :subtitle="t('icons.runtimeCaption')">
      <div class="icon-row"><SIcon :key="String(registered)" :name="runtimeName" :size="48" color="primary" :label="t('icons.brand')"><span>?</span></SIcon><STag :color="registered ? 'success' : 'warning'">{{ t(registered ? 'icons.registered' : 'icons.unregistered') }}</STag><SButton :loading="busy" :disabled="registered" @click="register">{{ t('icons.register') }}</SButton></div>
    </SCard>
    <SCard class="admin-card" :title="t('icons.fallback')" :subtitle="t('icons.fallbackCaption')">
      <div class="icon-row"><SIcon :name="missing" :size="36" :label="t('icons.missing')"><span>?</span></SIcon><code>{{ missing }}</code></div>
    </SCard>
    <SCard class="admin-card" :title="t('icons.localSource')" :subtitle="t('icons.localSourceCaption')">
      <SAlert color="primary">{{ t('icons.localSourceNote', { package: '@iconify-json/lucide' }) }}</SAlert>
      <pre class="source-code"><code>{{ localConfig }}</code></pre>
    </SCard>
    <SCard class="admin-card" :title="t('icons.privateApi')" :subtitle="t('icons.privateApiCaption')">
      <SAlert color="primary">{{ t('icons.privateApiNote') }}</SAlert>
      <pre class="source-code"><code>{{ apiConfig }}</code></pre>
    </SCard>
    <SCard class="admin-card" :title="t('icons.svgSource')" :subtitle="t('icons.svgSourceCaption')">
      <pre class="source-code"><code>{{ svgConfig }}</code></pre>
    </SCard>
  </div>
</template>
<style scoped>
.icon-examples { display: grid; gap: 20px; }
.icon-row { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; padding-top: 20px; }
.icon-sample { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 12px; box-shadow: inset 0 2px 10px rgb(0 0 0 / 0.05); }
.source-code { margin: 20px 0 0; padding: 16px; border-radius: 12px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; box-shadow: inset 0 2px 10px rgb(0 0 0 / 0.05); font-size: 13px; line-height: 1.8; }
</style>
