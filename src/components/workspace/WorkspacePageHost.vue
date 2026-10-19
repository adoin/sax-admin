<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  shallowRef,
  useTemplateRef,
  watch,
} from "vue";
import {
  loadRouteLocation,
  RouterView,
  useRoute,
  useRouter,
} from "vue-smart-router";
import type { RouteLocationNormalizedLoaded } from "vue-smart-router";
import { SButton, SScrollbar, SWindow } from "sax-design-vue";
import type { WindowInstance, ScrollbarInstance } from "sax-design-vue";
import { PanelsTopLeft, X } from "lucide-vue-next";
import type { WorkspaceTab } from "@/stores/workspace";
import { usePageWindows } from "./page-windows";
import { t } from "@/i18n";

const props = defineProps<{ tab: WorkspaceTab }>();
const windows = usePageWindows();
const state = computed(() => windows.state(props.tab.fullPath));
const route = useRoute(),
  router = useRouter();
const active = computed(
  () => route.fullPath === props.tab.fullPath && !state.value.pinned,
);
const visible = computed(() => active.value || state.value.pinned);
const mainBody = useTemplateRef<HTMLElement>("mainBody");
const windowBody = useTemplateRef<HTMLElement>("windowBody");
const content = useTemplateRef<HTMLElement>("content");
const windowRef = useTemplateRef<WindowInstance>("window");
const scrollbar = useTemplateRef<ScrollbarInstance>("scrollbar");
const pageRoute = shallowRef<RouteLocationNormalizedLoaded>();
const cacheName = computed(
  () => `${props.tab.fullPath}::${props.tab.revision}`,
);
let disposed = false;
onBeforeUnmount(() => {
  disposed = true;
});
loadRouteLocation(router.resolve(props.tab.fullPath)).then((value) => {
  if (!disposed) pageRoute.value = value;
});
let lastFocused: HTMLElement | undefined;
function rememberFocus(event: FocusEvent) {
  if (event.target instanceof HTMLElement) lastFocused = event.target;
}
watch(
  () => state.value.pinned,
  async () => {
    const element = content.value;
    if (!element) return;
    const scroll = [element, ...element.querySelectorAll<HTMLElement>("*")]
      .filter((el) => el.scrollTop || el.scrollLeft)
      .map((el) => ({ el, top: el.scrollTop, left: el.scrollLeft }));
    const focused =
      document.activeElement instanceof HTMLElement &&
      element.contains(document.activeElement)
        ? document.activeElement
        : lastFocused;
    const selection =
      focused instanceof HTMLInputElement ||
      focused instanceof HTMLTextAreaElement
        ? { start: focused.selectionStart, end: focused.selectionEnd }
        : undefined;
    await nextTick();
    for (const item of scroll) {
      item.el.scrollTop = item.top;
      item.el.scrollLeft = item.left;
    }
    scrollbar.value?.update();
    if (active.value && focused?.isConnected) {
      focused.focus({ preventScroll: true });
      if (
        selection &&
        selection.start !== null &&
        (focused instanceof HTMLInputElement ||
          focused instanceof HTMLTextAreaElement)
      ) {
        try {
          focused.setSelectionRange(selection.start, selection.end);
        } catch {
          /* Native input types without a selection API. */
        }
      }
    }
  },
  { flush: "pre" },
);
watch(
  () => state.value.focusVersion,
  async () => {
    await nextTick();
    windowRef.value?.focus();
  },
);
watch(visible, async (value) => {
  if (value) {
    await nextTick();
    scrollbar.value?.update();
  }
});
</script>

<template>
  <!-- Contain page sticky/fixed layers below the sibling windows. -->
  <div
    v-show="active"
    ref="mainBody"
    class="relative z-0 h-full min-h-0"
    :data-main-page="tab.fullPath"
  />
  <SWindow
    ref="window"
    v-show="state.pinned"
    v-model:rect="state.rect"
    :title="windows.title(tab)"
    :active="windows.isActive(tab.fullPath)"
    :z-index="state.zIndex + 5"
    :min-width="320"
    :min-height="220"
    title-editable
    :data-page-window="tab.fullPath"
    @update:title="state.alias = $event"
    @activate="windows.activate(tab.fullPath)"
  >
    <template #actions>
      <SButton
        type="transparent"
        icon
        :debounce="false"
        :aria-label="t('workspace.restoreWindow')"
        :title="t('workspace.restoreWindow')"
        @click="windows.restore(tab.fullPath)"
        ><PanelsTopLeft :size="17"
      /></SButton>
      <SButton
        type="transparent"
        icon
        :debounce="false"
        :aria-label="t('workspace.closeWindow')"
        @click="windows.close(tab.fullPath)"
        ><X :size="17"
      /></SButton>
    </template>
    <div ref="windowBody" class="h-full min-h-0 px-2 box-border" />
  </SWindow>
  <Teleport
    v-if="mainBody && windowBody && pageRoute"
    :to="state.pinned ? windowBody : mainBody"
  >
    <div
      ref="content"
      class="h-full min-h-0"
      :data-page-content="tab.fullPath"
      @focusin="rememberFocus"
    >
      <SScrollbar
        ref="scrollbar"
        class="admin-page-scroll"
        :style="state.pinned ? { width: '100%' } : undefined"
        wrap-class="s-layout-body"
        height="100%"
        placement="outside"
        :gap="3"
        :always="false"
        :wrap-style="{ overscrollBehavior: 'contain' }"
      >
        <div class="py-7 md:py-8 admin-page">
          <RouterView
            :route="pageRoute"
            :detached="!active"
            :cache-component-name="() => cacheName"
          >
            <template #default="{ Component }">
              <KeepAlive :include="[cacheName]"
                ><component :is="Component" v-if="visible"
              /></KeepAlive>
            </template>
          </RouterView>
        </div>
      </SScrollbar>
    </div>
  </Teleport>
</template>
