<script setup lang="ts">
import { t } from "@/i18n";
import { computed, shallowRef, watch, nextTick } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-smart-router";
import {
  SButton,
  SDialog,
  SInput,
  SAvatar,
  SBadge,
  SScrollbar,
  STag,
  SLayout,
} from "sax-design-vue";
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
  ChevronRight,
  LogOut,
  ShoppingBag,
  FolderKanban,
  ListChecks,
  Blocks,
} from "lucide-vue-next";
import { navigation } from "@/router";
import { sessionStore } from "@/stores/session";
import { preferencesStore } from "@/stores/preferences";
import { mockEnabled } from "@/api/client";
import WorkspaceTabs from "@/components/common/WorkspaceTabs.vue";
import AsideTools from "@/components/common/AsideTools.vue";
import { workspaceStore } from "@/stores/workspace";
import type { RouteLocationNormalizedLoaded } from "vue-smart-router";
const workspace = workspaceStore();
const layout = shallowRef<InstanceType<typeof SLayout>>();
const outsideCollapsed = shallowRef(false);
const scrollPositions = new globalThis.Map<string, number>();
const cacheName = (page: RouteLocationNormalizedLoaded) => workspace.cacheName(page.fullPath);
const route = useRoute(),
  router = useRouter(),
  session = sessionStore(),
  preferences = preferencesStore();
const icons = {
  LayoutDashboard,
  Users,
  ChartNoAxesCombined,
  Map,
  Settings2,
  ShoppingBag,
  FolderKanban,
  ListChecks,
  Blocks,
};
const sections = [
  "section.workspace",
  "section.insights",
  "section.examples",
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
watch(() => route.fullPath, async (path, previous) => {
  const root = layout.value?.$el as HTMLElement | undefined;
  const body = root?.querySelector<HTMLElement>(':scope > .s-layout__content > .s-layout-body');
  if (!body) return;
  scrollPositions.set(previous, body.scrollTop);
  await nextTick();
  body.scrollTop = scrollPositions.get(path) || 0;
});
function logout() {
  session.clear();
  workspace.reset();
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
    <SLayout
      ref="layout"
      class="admin-shell"
      :class="{ 'is-mobile-open': preferences.mobileOpen }"
      :aside-width="preferences.collapsed ? 84 : 248"
      :padding="12"
      :gap="12"
      :header-height="64"
      :footer-height="48"
      min-height="100dvh"
      :responsive="false"
      v-model:aside-outside-collapsed="outsideCollapsed"
      @keydown.esc="preferences.mobileOpen = false"
    >
      <template #aside>
      <div class="admin-sidebar">
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
      <SScrollbar class="flex-1 min-h-0" height="100%"
        ><nav :aria-label="t('shell.navigation')">
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
        </nav></SScrollbar
      >
      <div class="flex items-center gap-3 px-2">
        <SAvatar :size="36" shape="circle"
          ><template #text>{{ session.current?.name }}</template></SAvatar
        >
        <div v-if="!preferences.collapsed" class="flex-1 min-w-0">
          <p class="text-12px font-600 m-0 truncate">
            {{ session.current?.name }}
          </p>
          <span class="text-10px text-muted">{{
            session.isAdmin ? t("shell.admin") : t("shell.viewer")
          }}</span>
        </div>
        <SButton
          type="transparent"
          :debounce="false"
          icon
          v-if="!preferences.collapsed"
          class="icon-button shrink-0"
          :aria-label="t('shell.logout')"
          @click="logout"
        >
          <LogOut :size="17" />
        </SButton>
      </div>
      </div>
      </template>
      <template #aside-outside>
        <AsideTools @navigate="preferences.mobileOpen = false" />
      </template>
      <template #header>
      <div class="admin-header">
        <div class="flex items-center gap-4">
          <SButton
            type="transparent"
            :debounce="false"
            icon
            class="icon-button hidden lg:flex"
            :aria-label="t('shell.collapse')"
            @click="preferences.collapsed = !preferences.collapsed"
          >
            <PanelLeftClose :size="18" /></SButton
          ><SButton
            type="transparent"
            :debounce="false"
            icon
            class="icon-button lg:hidden"
            :aria-label="t('shell.openNav')"
            @click="preferences.mobileOpen = true"
          >
            <Menu :size="20" /></SButton
          ><span class="text-muted hidden sm:inline">{{
            t("section.workspace")
          }}</span
          ><ChevronRight
            :size="13"
            class="text-slate-300 hidden sm:block"
          /><span class="font-500 text-13px">{{
            active ? t(active.label) : t('workspace.draft', { id: String(route.params.id || '') })
          }}</span>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
          <SButton
            type="transparent"
            :debounce="false"
            class="flex items-center gap-2 text-muted bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-3 border-0"
            :aria-label="t('shell.search')"
            @click="searchOpen = true"
          >
            <Search :size="16" /><span class="hidden md:block text-12px">{{
              t("shell.searchPlaceholder")
            }}</span></SButton
          ><SBadge is-dot
            ><SButton
              type="transparent"
              :debounce="false"
              icon
              class="icon-button relative"
              :aria-label="t('shell.notifications')"
              @click="notifications = true"
            >
              <Bell :size="19" /></SButton
          ></SBadge>
          <STag color="success" class="hidden md:inline-flex">{{
            mockEnabled ? t("shell.demo") : t("shell.api")
          }}</STag>
        </div>
      </div>
      </template>
      <WorkspaceTabs />
      <div class="py-7 md:py-8 admin-page">
        <RouterView v-slot="{ Component }" :cache-component-name="cacheName">
          <KeepAlive :include="workspace.cacheNames">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </div>
      <template #footer>
      <div class="admin-footer text-11px text-muted">
        <span
          >© {{ new Date().getFullYear() }} Sax Admin. Crafted for your next
          idea.</span
        ><span>Vue 3 · Sax Design Vue</span>
      </div>
      </template>
    </SLayout>
    <SDialog v-model="searchOpen" :title="t('shell.searchTitle')" width="520px"
      ><SInput
        v-model="keyword"
        :placeholder="t('shell.searchInput')"
        block
        clearable
      />
      <div class="mt-4 flex flex-col gap-2">
        <SButton
          type="transparent"
          :debounce="false"
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
        </SButton>
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
<style scoped>
.admin-shell { height: 100dvh; }
.admin-shell :deep(.s-layout__content > .s-layout-aside) {
  min-width: 0; height: 100%; z-index: 30;
}
.admin-shell :deep(.s-layout-aside__content) { height: 100%; overflow: hidden; }
.admin-sidebar { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.admin-shell :deep(.s-layout__content > .s-layout-body) { padding: 0; scrollbar-gutter: stable; }
.admin-header { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; }
.admin-footer { display: flex; flex-wrap: wrap; justify-content: space-between; width: 100%; gap: 8px; }
.admin-page { width: 100%; padding-inline: 20px; padding-bottom: 64px; }
@media (max-width: 1023px) {
  .admin-shell :deep(.s-layout__content > .s-layout-aside) { position: fixed; inset: 12px auto 12px 12px; height: calc(100dvh - 24px); width: 248px !important; z-index: 40; visibility: hidden; transform: translateX(calc(-100% - 180px)); }
  .admin-shell.is-mobile-open :deep(.s-layout__content > .s-layout-aside) { visibility: visible; transform: translateX(0); }
  .admin-shell :deep(.s-layout-aside__content) { height: calc(100% - 56px); }
  .admin-shell :deep(.s-layout-aside__outside) { position: static; margin-top: 12px; width: fit-content; border-radius: var(--sax-radius-md); }
  .admin-shell :deep(.s-layout-aside__outside::before) { display: none; }
}
</style>
