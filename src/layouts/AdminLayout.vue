<script setup lang="ts">
import { t } from "@/i18n";
import { computed, shallowRef, watch, nextTick, onMounted } from "vue";
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
  SLayoutHeader,
  SMenu,
} from "sax-design-vue";
import {
  PanelLeftClose,
  Menu,
  Search,
  Bell,
  ChevronRight,
  LogOut,
} from "lucide-vue-next";
import { navigation } from "@/router";
import { sessionStore } from "@/stores/session";
import { preferencesStore } from "@/stores/preferences";
import { mockEnabled } from "@/api/client";
import WorkspaceTabs from "@/components/common/WorkspaceTabs.vue";
import AsideTools from "@/components/common/AsideTools.vue";
import { workspaceStore } from "@/stores/workspace";
import { menusStore, menuLabel } from "@/stores/menus";
import type { RouteLocationNormalizedLoaded } from "vue-smart-router";
import type { ScrollbarInstance, MenuKey } from "sax-design-vue";
const workspace = workspaceStore();
const menus = menusStore();
const menuOpenKeys = shallowRef<MenuKey[]>(menus.records.filter((row) => row.kind === 'group').map((row) => row.id));
let inlineMenuKeys = [...menuOpenKeys.value];
onMounted(() => menus.refresh());
const pageScrollbar = shallowRef<ScrollbarInstance>();
const outsideCollapsed = shallowRef(false);
const scrollPositions = new globalThis.Map<string, number>();
const cacheName = (page: RouteLocationNormalizedLoaded) => workspace.cacheName(page.fullPath);
const route = useRoute(),
  router = useRouter(),
  session = sessionStore(),
  preferences = preferencesStore();
watch(() => preferences.collapsed && !preferences.mobileOpen, (collapsed) => {
  if (collapsed) { inlineMenuKeys = [...menuOpenKeys.value]; menuOpenKeys.value = []; }
  else menuOpenKeys.value = [...inlineMenuKeys];
}, { immediate: true });
const searchOpen = shallowRef(false),
  notifications = shallowRef(false),
  keyword = shallowRef("");
const matches = computed(() =>
  menus.visiblePages.filter((item) =>
    `${item.titleZh} ${item.titleEn} ${item.path}`.toLowerCase().includes(keyword.value.toLowerCase()),
  ),
);
const active = computed(() =>
  navigation.find((item) => item.path === route.path),
);
const selectedMenu = computed(() => {
  const selected = menus.records.find((row) => row.id === menus.selectedId && row.path === route.path);
  return (selected || menus.records.find((row) => row.kind === 'page' && row.path === route.path))?.id;
});
function selectMenu(value: string | number) {
  const row = menus.records.find((row) => row.id === String(value));
  if (row?.kind === 'page') { menus.selectedId = row.id; navigate(row.path); }
}
let displayedPath = route.fullPath, restoringScroll = false, scrollRevision = 0;
function rememberScroll({ scrollTop }: { scrollTop: number }) {
  if (!restoringScroll) scrollPositions.set(displayedPath, scrollTop);
}
watch(() => route.fullPath, async (path) => {
  const revision = ++scrollRevision;
  restoringScroll = true;
  await nextTick();
  if (revision !== scrollRevision) return;
  displayedPath = path;
  pageScrollbar.value?.setScrollTop(scrollPositions.get(path) || 0);
  pageScrollbar.value?.update();
  await nextTick();
  if (revision === scrollRevision) restoringScroll = false;
}, { flush: 'sync' });
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
  <div class="admin-root">
    <button
      v-if="preferences.mobileOpen"
      class="fixed inset-0 z-35 bg-black/30 border-0 lg:hidden"
      :aria-label="t('shell.closeNav')"
      @click="preferences.mobileOpen = false"
    />
    <SLayout
      class="admin-shell"
      :class="{ 'is-mobile-open': preferences.mobileOpen }"
      :aside-width="preferences.collapsed ? 84 : 248"
      :padding="12"
      :gap="12"
      :header-height="64"
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
        ><img src="/sax-logo-mark.svg" alt="" class="w-9 h-9 shrink-0" />
        <div v-if="!preferences.collapsed">
          <span class="font-750 text-lg tracking-tight"
            >Sax Admin<span class="text-brand">.</span></span
          ><span class="block text-10px text-muted tracking-widest mt-0.5"
            >YOUR WORKSPACE, SIMPLIFIED</span
          >
        </div></RouterLink
      >
      <SScrollbar class="admin-menu-scroll flex-1 min-h-0" height="100%" placement="outside" :gap="3" :always="false"><SMenu class="admin-menu" :options="menus.options" :model-value="selectedMenu" :collapse="preferences.collapsed && !preferences.mobileOpen" :open-keys="menuOpenKeys" :unique-open="preferences.collapsed && !preferences.mobileOpen" variant="plain" :aria-label="t('shell.navigation')" @update:open-keys="menuOpenKeys = $event" @select="selectMenu" /></SScrollbar>
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
            selectedMenu ? menuLabel(menus.records.find((row) => row.id === selectedMenu)!) : active ? t(active.label) : route.name === 'workspace-empty' ? t('workspace.emptyTitle') : t('workspace.draft', { id: String(route.params.id || '') })
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
      <SLayoutHeader v-if="workspace.tabs.length" class="workspace-tab-surface" :padding="0">
        <WorkspaceTabs />
      </SLayoutHeader>
      <SScrollbar ref="pageScrollbar" class="admin-page-scroll" wrap-class="s-layout-body" height="100%" placement="outside" :gap="3" :always="false" :wrap-style="{ overscrollBehavior: 'contain' }" @scroll="rememberScroll">
      <div class="py-7 md:py-8 admin-page">
        <RouterView v-slot="{ Component }" :cache-component-name="cacheName">
          <KeepAlive :include="workspace.cacheNames">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </div>
      </SScrollbar>
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
          :key="item.id"
          class="border-0 bg-slate-50 dark:bg-slate-800 rounded-3 p-4 flex items-center justify-between text-left"
          @click="menus.selectedId = item.id; navigate(item.path)"
        >
          <div>
            <b>{{ menuLabel(item) }}</b>
            <p class="text-12px text-muted mb-0 mt-1">{{ item.path }}</p>
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
.admin-root { height: 100dvh; overflow: clip; }
.admin-shell { height: 100dvh; }
.admin-shell :deep(.s-layout__content > .s-layout-aside) {
  min-width: 0; height: 100%; z-index: 30;
}
.admin-shell :deep(.s-layout-aside__content) { height: 100%; overflow: hidden; }
.admin-sidebar { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.admin-menu.s-menu { width: 100%; }
.admin-shell :deep(.s-layout__content > .s-layout-body) { display: flex; flex-direction: column; gap: 12px; padding: 0; overflow: visible; background: transparent; box-shadow: none; border-radius: 0; }
.workspace-tab-surface { flex-shrink: 0; }
.admin-page-scroll { flex: 1; min-height: 0; width: calc(100% + 9px); max-width: none; overflow: visible; }
.admin-page-scroll.is-outside { grid-template-columns: minmax(0, 1fr) 9px; }
.admin-page-scroll :deep(> .s-scrollbar__wrap) { padding: 0; }
.admin-header { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; }
.admin-page { width: 100%; padding-inline: 20px; padding-bottom: 64px; }
@media (max-width: 1023px) {
  .admin-shell :deep(.s-layout__content > .s-layout-aside) { position: fixed; inset: 12px auto 12px 12px; height: calc(100dvh - 24px); width: 248px !important; z-index: 40; visibility: hidden; transform: translateX(calc(-100% - 180px)); }
  .admin-shell.is-mobile-open :deep(.s-layout__content > .s-layout-aside) { visibility: visible; transform: translateX(0); }
  .admin-shell :deep(.s-layout-aside__content) { height: calc(100% - 56px); }
  .admin-shell :deep(.s-layout-aside__outside) { position: static; margin-top: 12px; width: fit-content; border-radius: var(--sax-radius-md); }
  .admin-shell :deep(.s-layout-aside__outside::before) { display: none; }
}
</style>
