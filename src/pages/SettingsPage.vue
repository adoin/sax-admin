<script setup lang="ts">
import { SCard } from "sax-design-vue";
import { t, locale, setLocale } from "@/i18n";
import { SSwitch, SSelect } from "sax-design-vue";
import {
  Languages,
  Moon,
  PanelLeft,
  ShieldCheck,
  ExternalLink,
} from "lucide-vue-next";
import { preferencesStore } from "@/stores/preferences";
import { sessionStore } from "@/stores/session";
import { mockEnabled } from "@/api/client";
import PageHeading from "@/components/common/PageHeading.vue";
const preferences = preferencesStore(),
  session = sessionStore();
</script>
<template>
  <PageHeading
    :title="t('settings.title')"
    :caption="t('settings.caption')"
    eyebrow="PREFERENCES"
  />
  <div class="grid xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
    <section class="">
      <SCard class="admin-card">
        <div class="flex items-center gap-4 py-5 mb-5">
          <Languages :size="21" class="text-brand" />
          <div class="flex-1">
            <b class="text-sm">{{ t("settings.language") }}</b>
            <p class="text-12px text-muted mb-0 mt-2">
              {{ t("settings.languageCaption") }}
            </p>
          </div>
          <SSelect
            :model-value="locale"
            :options="[
              { label: '简体中文', value: 'zh-CN' },
              { label: 'English', value: 'en-US' },
            ]"
            :aria-label="t('settings.language')"
            @update:model-value="
              (value) => setLocale(value === 'en-US' ? 'en-US' : 'zh-CN')
            "
          />
        </div>
        <h2 class="section-title m-0 mb-6">{{ t("settings.appearance") }}</h2>
        <div class="flex items-center gap-4 py-5">
          <Moon :size="21" class="text-brand" />
          <div class="flex-1">
            <b class="text-sm">{{ t("settings.dark") }}</b>
            <p class="text-12px text-muted mb-0 mt-2">
              {{ t("settings.darkCaption") }}
            </p>
          </div>
          <SSwitch
            :model-value="preferences.dark"
            :aria-label="t('settings.dark')"
            @update:model-value="preferences.toggleTheme"
          />
        </div>
        <div class="flex items-center gap-4 py-5">
          <PanelLeft :size="21" class="text-brand" />
          <div class="flex-1">
            <b class="text-sm">{{ t("settings.compact") }}</b>
            <p class="text-12px text-muted mb-0 mt-2">
              {{ t("settings.compactCaption") }}
            </p>
          </div>
          <SSwitch
            v-model="preferences.collapsed"
            :aria-label="t('settings.compact')"
          />
        </div>
      </SCard>
    </section>
    <section class="">
      <SCard class="admin-card">
        <h2 class="section-title m-0 mb-6">{{ t("settings.account") }}</h2>
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-full bg-blue-50 text-brand flex items-center justify-center text-xl font-700"
          >
            {{ session.current?.name.slice(0, 1) }}
          </div>
          <div>
            <b>{{ session.current?.name }}</b>
            <p class="text-12px text-muted mt-2 mb-0">
              {{ session.isAdmin ? t("settings.admin") : t("settings.viewer") }}
            </p>
          </div>
        </div>
        <div
          class="bg-emerald-50 dark:bg-emerald-900/20 rounded-3 p-4 flex gap-3 items-start mt-6 text-emerald-700 dark:text-emerald-300"
        >
          <ShieldCheck :size="19" class="shrink-0" />
          <div>
            <b class="text-12px">{{
              mockEnabled ? t("settings.demo") : t("settings.remote")
            }}</b>
            <p class="text-11px leading-6 mb-0 mt-1">
              {{
                mockEnabled ? t("settings.demoBody") : t("settings.remoteBody")
              }}
            </p>
          </div>
        </div>
      </SCard>
    </section>
    <section class="xl:col-span-2">
      <SCard class="admin-card">
        <h2 class="section-title m-0 mb-4">{{ t("settings.about") }}</h2>
        <p class="text-sm text-muted leading-7 max-w-180">
          {{ t("settings.aboutBody") }}
        </p>
        <a
          href="https://adoin.github.io/sax-design-vue/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex text-brand gap-2 items-center text-sm mt-3"
          >{{ t("settings.docs") }}<ExternalLink :size="14"
        /></a>
      </SCard>
    </section>
  </div>
</template>
