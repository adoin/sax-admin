import { computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, shallowRef, watch } from 'vue';
import type { ComponentPublicInstance, Ref } from 'vue';

/** Allocate a final content container the remaining route viewport, without coupling it to window height. */
export function useRemainingHeight(target: Ref<HTMLElement | ComponentPublicInstance | undefined>, options: { minHeight?: number; bottomGap?: number } = {}) {
  const height = shallowRef(options.minHeight ?? 320);
  let observer: ResizeObserver | undefined;
  let mutations: MutationObserver | undefined;
  let frame = 0;
  let active = false;
  let connection = 0;
  const element = () => {
    const value = target.value;
    return value instanceof HTMLElement ? value : value?.$el instanceof HTMLElement ? value.$el as HTMLElement : undefined;
  };
  function measure() {
    frame = 0;
    if (!active) return;
    const el = element();
    const viewport = el?.closest<HTMLElement>('.admin-page-scroll > .s-scrollbar__wrap');
    const page = el?.closest<HTMLElement>('.admin-page');
    if (!el || !viewport || !page || !el.getClientRects().length || !viewport.clientHeight) return;
    const top = el.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
    const bottom = options.bottomGap ?? (parseFloat(getComputedStyle(page).paddingBottom) || 0);
    // Narrow windows wrap query/toolbar/pagination controls. Keep enough
    // content height for a usable virtual viewport and let the page scroll.
    const windowed = !!viewport.closest('[data-page-window]');
    let minimum = options.minHeight ?? (windowed ? 400 : 240);
    const table = windowed ? el.querySelector<HTMLElement>('[role="table"]') : null;
    if (table) {
      // Measure the actual non-data content instead of assuming filters and
      // pagination occupy one row. Reserve a small readable data viewport.
      minimum = Math.max(minimum, Math.ceil(el.scrollHeight - table.getBoundingClientRect().height + 160));
    }
    const next = Math.max(minimum, Math.floor(viewport.clientHeight - top - bottom));
    if (height.value !== next) height.value = next;
  }
  function refresh() {
    if (active && !frame) frame = requestAnimationFrame(measure);
  }
  function disconnect() {
    connection++;
    active = false;
    observer?.disconnect();
    mutations?.disconnect();
    window.removeEventListener('resize', refresh);
    cancelAnimationFrame(frame);
    frame = 0;
  }
  async function connect() {
    disconnect();
    active = true;
    const version = connection;
    await nextTick();
    if (!active || version !== connection) return;
    const el = element();
    const page = el?.closest<HTMLElement>('.admin-page');
    if (!el || !page) return;
    observer = new ResizeObserver(refresh);
    // Observe ancestors and preceding content so headings, alerts and responsive queries can resize.
    let node: HTMLElement | null = el;
    while (node && !node.classList.contains('admin-page-scroll')) {
      observer.observe(node);
      for (const sibling of Array.from(node.parentElement?.children ?? [])) observer.observe(sibling);
      node = node.parentElement;
    }
    mutations = new MutationObserver(refresh);
    mutations.observe(page, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', refresh, { passive: true });
    measure();
  }
  onMounted(connect);
  onActivated(connect);
  onDeactivated(disconnect);
  onBeforeUnmount(disconnect);
  watch(target, connect, { flush: 'post' });
  return { height, style: computed(() => height.value === undefined ? undefined : ({ height: `${height.value}px` })), refresh };
}
