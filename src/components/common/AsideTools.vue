<script setup lang="ts">
import { SButton, SSwitch } from "sax-design-vue";
import { Settings2, Languages, Moon, Sun } from "lucide-vue-next";
import { useRouter } from "vue-smart-router";
import { t, locale, toggleLocale } from "@/i18n";
import { preferencesStore } from "@/stores/preferences";
const router = useRouter(), preferences = preferencesStore();
const emit = defineEmits<{ navigate: [] }>();
function settings() { router.push('/settings'); emit('navigate'); }
</script>
<template>
  <div class="aside-tools">
    <SButton icon type="transparent" :debounce="false" :title="t('nav.settings')" :aria-label="t('nav.settings')" @click="settings"><Settings2 :size="17" /></SButton>
    <SButton icon type="transparent" :debounce="false" :title="locale === 'zh-CN' ? 'English' : '中文'" :aria-label="t('shell.language')" @click="toggleLocale"><Languages :size="17" /></SButton>
    <SSwitch :model-value="preferences.dark" :aria-label="preferences.dark ? t('shell.light') : t('shell.dark')" @update:model-value="preferences.toggleTheme">
      <template #circle><Moon v-if="preferences.dark" :size="15" /><Sun v-else :size="15" /></template>
    </SSwitch>
  </div>
</template>
<style scoped>
.aside-tools { display: flex; align-items: center; gap: 4px; min-height: 44px; }
</style>
