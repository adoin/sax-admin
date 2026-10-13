<script setup lang="ts">
import { t, locale, toggleLocale } from "@/i18n";
import { computed, shallowRef } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-smart-router";
import { SButton, SDialog, SInput } from "sax-design-vue";
import {
  LayoutDashboard,
  Users,
  ChartNoAxesCombined,
  Map,
  Settings2,
  PanelLeftClose,
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  ArrowUpRight,
  LogOut,
  Languages,
} from "lucide-vue-next";
import { navigation } from "@/router";
import { sessionStore } from "@/stores/session";
import { preferencesStore } from "@/stores/preferences";
import { mockEnabled } from "@/api/client";
const route = useRoute(),
  router = useRouter(),
  session = sessionStore(),
  preferences = preferencesStore();
const icons = { LayoutDashboard, Users, ChartNoAxesCombined, Map, Settings2 };
const sections = [
  "section.workspace",
  "section.insights",
  "section.system",
] as const;
const searchOpen = shallowRef(false),
  notifications = shallowRef(false),
  keyword = shallowRef("");
const matches = computed(() =>
  navigation.filter((item) =>
    `${t(item.label)} ${t(item.caption)}`.includes(keyword.value),
  ),
);
const active = computed(() =>
  navigation.find((item) => item.path === route.path),
);
function logout() {
  session.clear();
  router.push("/login");
}
function navigate(path: string) {
  router.push(path);
  searchOpen.value = false;
  preferences.mobileOpen = false;
}
</script>
<template>
  <div class="min-h-screen">
    <button
      v-if="preferences.mobileOpen"
      class="fixed inset-0 z-35 bg-black/30 border-0 lg:hidden"
      :aria-label="t('shell.closeNav')"
      @click="preferences.mobileOpen = false"
    />
    <aside
      class="fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-slate-900 flex flex-col p-5 transition-transform duration-200 w-62"
      :class="[
        preferences.mobileOpen
          ? 'translate-x-0'
          : '-translate-x-full lg:translate-x-0',
        preferences.collapsed ? 'lg:w-21' : '',
      ]"
    >
      <RouterLink
        to="/dashboard"
        class="flex items-center gap-3 px-2 h-12 mb-9"
        :aria-label="t('shell.home')"
        ><span
          class="w-9 h-9 rounded-3 bg-brand text-white flex items-center justify-center font-800 text-xl shadow-lg shadow-blue-500/20"
          >s.</span
        >
        <div v-if="!preferences.collapsed">
          <span class="font-750 text-lg tracking-tight"
            >Sax Admin<span class="text-brand">.</span></span
          ><span class="block text-10px text-muted tracking-widest mt-0.5"
            >YOUR WORKSPACE, SIMPLIFIED</span
          >
        </div></RouterLink
      >
      <nav :aria-label="t('shell.navigation')" class="flex-1">
        <div v-for="section in sections" :key="section" class="mb-7">
          <p
            v-if="!preferences.collapsed"
            class="text-11px text-muted px-3 mb-3"
          >
            {{ t(section) }}
          </p>
          <RouterLink
            v-for="item in navigation.filter((n) => n.section === section)"
            :key="item.path"
            :to="item.path"
            :title="t(item.label)"
            class="flex items-center gap-3 px-3 py-3 rounded-3 mb-1.5 text-13px font-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            :class="
              route.path === item.path
                ? 'bg-blue-50 text-brand dark:bg-blue-500/15'
                : 'text-muted'
            "
            :aria-current="route.path === item.path ? 'page' : undefined"
            @click="preferences.mobileOpen = false"
            ><component
              :is="icons[item.icon]"
              :size="19"
              :stroke-width="1.8"
            /><span v-if="!preferences.collapsed">{{ t(item.label) }}</span
            ><span
              v-if="item.path === '/charts' && !preferences.collapsed"
              class="ml-auto text-9px px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-brand"
              >GPU</span
            ></RouterLink
          >
        </div>
      </nav>
      <div
        v-if="!preferences.collapsed"
        class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-950 rounded-4 p-4 mb-5"
      >
        <span class="text-10px tracking-widest text-brand font-700"
          >BUILT FOR BETTER WORK</span
        >
        <p class="font-600 text-sm mt-2 mb-2">{{ t("shell.tagline") }}</p>
        <a
          href="https://adoin.github.io/sax-design-vue/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-12px text-brand flex items-center gap-2"
          >{{ t("shell.docs") }} <ArrowUpRight :size="14"
        /></a>
      </div>
      <div class="flex items-center gap-3 px-2">
        <span
          class="rounded-full bg-indigo-100 text-indigo-600 w-9 h-9 flex items-center justify-center font-600"
          >{{ session.current?.name.slice(0, 1) }}</span
        >
        <div v-if="!preferences.collapsed" class="flex-1 min-w-0">
          <p class="text-12px font-600 m-0 truncate">
            {{ session.current?.name }}
          </p>
          <span class="text-10px text-muted">{{
            session.isAdmin ? t("shell.admin") : t("shell.viewer")
          }}</span>
        </div>
        <button
          v-if="!preferences.collapsed"
          class="icon-button shrink-0"
          :aria-label="t('shell.logout')"
          @click="logout"
        >
          <LogOut :size="17" />
        </button>
      </div>
    </aside>
    <div
      class="transition-[margin] duration-200"
      :class="preferences.collapsed ? 'lg:ml-21' : 'lg:ml-62'"
    >
      <header
        class="h-19 px-5 md:px-8 bg-white/80 dark:bg-slate-900/90 flex items-center justify-between sticky top-0 z-25 backdrop-blur-lg"
      >
        <div class="flex items-center gap-4">
          <button
            class="icon-button hidden lg:flex"
            :aria-label="t('shell.collapse')"
            @click="preferences.collapsed = !preferences.collapsed"
          >
            <PanelLeftClose :size="18" /></button
          ><button
            class="icon-button lg:hidden"
            :aria-label="t('shell.openNav')"
            @click="preferences.mobileOpen = true"
          >
            <Menu :size="20" /></button
          ><span class="text-muted hidden sm:inline">{{
            t("section.workspace")
          }}</span
          ><ChevronRight
            :size="13"
            class="text-slate-300 hidden sm:block"
          /><span class="font-500 text-13px">{{
            active ? t(active.label) : ""
          }}</span>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
          <button
            class="flex items-center gap-2 text-muted bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-3 border-0"
            :aria-label="t('shell.search')"
            @click="searchOpen = true"
          >
            <Search :size="16" /><span class="hidden md:block text-12px">{{
              t("shell.searchPlaceholder")
            }}</span></button
          ><button
            class="flex items-center gap-1.5 border-0 bg-transparent text-muted rounded-3 p-2 text-xs"
            :aria-label="t('shell.language')"
            @click="toggleLocale"
          >
            <Languages :size="17" /><span>{{
              locale === "zh-CN" ? "EN" : "中文"
            }}</span></button
          ><button
            class="icon-button"
            :aria-label="preferences.dark ? t('shell.light') : t('shell.dark')"
            @click="preferences.toggleTheme"
          >
            <Sun v-if="preferences.dark" :size="18" /><Moon
              v-else
              :size="18"
            /></button
          ><button
            class="icon-button relative"
            :aria-label="t('shell.notifications')"
            @click="notifications = true"
          >
            <Bell :size="19" /><span
              class="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full"
            /></button
          ><span
            class="hidden md:block text-11px bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-full dark:bg-emerald-900/30"
            >{{ mockEnabled ? t("shell.demo") : t("shell.api") }}</span
          >
        </div>
      </header>
      <main class="px-5 py-7 md:px-8 md:py-8 max-w-400 mx-auto">
        <RouterView />
      </main>
      <footer
        class="px-8 pb-6 flex flex-wrap gap-2 justify-between text-11px text-muted"
      >
        <span
          >© {{ new Date().getFullYear() }} Sax Admin. Crafted for your next
          idea.</span
        ><span>Vue 3 · Sax Design Vue</span>
      </footer>
    </div>
    <SDialog v-model="searchOpen" :title="t('shell.searchTitle')" width="520px"
      ><SInput
        v-model="keyword"
        :placeholder="t('shell.searchInput')"
        block
        clearable
      />
      <div class="mt-4 flex flex-col gap-2">
        <button
          v-for="item in matches"
          :key="item.path"
          class="border-0 bg-slate-50 dark:bg-slate-800 rounded-3 p-4 flex items-center justify-between text-left"
          @click="navigate(item.path)"
        >
          <div>
            <b>{{ t(item.label) }}</b>
            <p class="text-12px text-muted mb-0 mt-1">{{ t(item.caption) }}</p>
          </div>
          <ChevronRight :size="16" />
        </button>
        <p v-if="!matches.length" class="text-muted">
          {{ t("shell.noResults") }}
        </p>
      </div></SDialog
    >
    <SDialog
      v-model="notifications"
      :title="t('shell.noticeTitle')"
      width="440px"
      ><div class="py-6 text-center">
        <Bell class="text-brand mx-auto mb-4" :size="32" /><b>{{
          t("shell.ready")
        }}</b>
        <p class="text-muted text-sm leading-6">{{ t("shell.noticeBody") }}</p>
        <SButton
          @click="
            navigate('/users');
            notifications = false;
          "
          >{{ t("shell.manageUsers") }}</SButton
        >
      </div></SDialog
    >
  </div>
</template>
