import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { effectScope, nextTick } from 'vue';
import { createMemoryHistory, createRouter, isNavigationFailure } from 'vue-smart-router';
import { workspaceStore, tabCloseTargets } from '../src/stores/workspace';
import { createPageWindowManager } from '../src/components/workspace/page-windows';
import { canRenameRouteTab } from '../src/components/workspace/tab-title';

const scopes: ReturnType<typeof effectScope>[] = [];
beforeEach(() => setActivePinia(createPinia()));
afterEach(() => { for (const scope of scopes.splice(0)) scope.stop(); });
async function fixture() {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/', name: 'admin', component: {}, children: [
      { path: 'launchpad', name: 'empty', component: {}, meta: { tabless: true } },
      { path: 'drafts/:id', name: 'workspace-draft', component: {}, meta: { title: 'workspace.draft' } },
    ] },
  ] });
  const workspace = workspaceStore();
  router.afterEach((to, _from, failure) => { if (!failure) workspace.visit(to); });
  await router.push('/drafts/1?channel=sales');
  const scope = effectScope(); scopes.push(scope);
  const windows = scope.run(() => createPageWindowManager(workspace, {
    get fullPath() { return router.currentRoute.value.fullPath; },
  }, router))!;
  return { workspace, router, windows };
}
describe('page window lifecycle', () => {
  it('distinguishes path parameters from static and escaped-colon paths', () => {
    expect(canRenameRouteTab([{ path: '/drafts/:id' }])).toBe(true);
    expect(canRenameRouteTab([{ path: '/case-:id?' }])).toBe(true);
    expect(canRenameRouteTab([{ path: '/users' }])).toBe(false);
    expect(canRenameRouteTab([{ path: '/literal\\:name' }])).toBe(false);
  });
  it('renames one route instance without changing its cache identity and shares the alias with its window', async () => {
    const { workspace, router, windows } = await fixture();
    const path = workspace.tabs[0].fullPath;
    const first = workspace.tabs[0];
    const cacheName = workspace.cacheName(path);
    await router.push('/drafts/2?channel=support');
    expect(canRenameRouteTab(router.resolve(path).matched)).toBe(true);
    expect(canRenameRouteTab(router.resolve('/launchpad?draft=1').matched)).toBe(false);
    expect(windows.rename(path, '  Sales review  ')).toBe(true);
    expect(windows.title(first)).toBe('Sales review');
    expect(windows.title(workspace.tabs[1])).not.toBe('Sales review');
    expect(workspace.cacheName(path)).toBe(cacheName);
    expect(workspace.tabs[0]).toBe(first);
    expect(windows.rename(path, '   ')).toBe(false);
    expect(windows.title(first)).toBe('Sales review');
    await windows.pin(path);
    await windows.restore(path);
    expect(windows.title(first)).toBe('Sales review');
    workspace.refresh(path);
    expect(windows.title(first)).toBe('Sales review');
    workspace.remove(path);
    await nextTick();
    expect(windows.rename(path, 'Closed')).toBe(false);
    expect(windows.states.has(path)).toBe(false);
  });
  it('starts in the workspace and keeps viewport coordinates across restores and refreshes', async () => {
    const { workspace, windows } = await fixture();
    const path = workspace.tabs[0].fullPath;
    windows.setWorkspaceBounds(() => ({ x: 272, y: 162, width: 1000, height: 600 }));
    await windows.pin(path);
    expect(windows.state(path).rect).toEqual({ x: 322, y: 192, width: 900, height: 540 });
    windows.state(path).rect = { ...windows.state(path).rect, x: 40, y: 50 };
    await windows.restore(path);
    windows.state(path).rect = { ...windows.state(path).rect, width: 600, height: 400 };
    windows.setWorkspaceBounds(() => ({ x: 100, y: 120, width: 800, height: 500 }));
    workspace.refresh(path);
    await windows.pin(path);
    expect(windows.state(path).rect).toEqual({ x: 40, y: 50, width: 600, height: 400 });
    expect(workspace.tabs[0].revision).toBe(1);
  });
  it('uses the current content area on first pin and keeps minimum window dimensions', async () => {
    const { workspace, router, windows } = await fixture();
    const first = workspace.tabs[0].fullPath;
    let bounds = { x: 272, y: 162, width: 1000, height: 600 };
    windows.setWorkspaceBounds(() => bounds);
    await windows.pin(first);
    await router.push('/drafts/2');
    bounds = { x: 0, y: 80, width: 300, height: 200 };
    await windows.pin('/drafts/2');
    expect(windows.state('/drafts/2').rect).toEqual({ x: 0, y: 80, width: 320, height: 220 });
    expect(windows.state(first).rect).toEqual({ x: 322, y: 192, width: 900, height: 540 });
  });
  it('removes pinned pages from route tabs and bulk close targets, then restores their original position', async () => {
    const { workspace, router, windows } = await fixture();
    const first = workspace.tabs[0];
    await router.push('/drafts/2');
    const second = workspace.tabs[1];
    await windows.pin(first.fullPath);
    expect(windows.routeTabs.value).toEqual([second]);
    const closing = tabCloseTargets(windows.routeTabs.value, second.fullPath, 'all');
    expect(closing).toEqual([second.fullPath]);
    await router.push('/launchpad');
    workspace.retain(workspace.tabs.filter(tab => !closing.includes(tab.fullPath)).map(tab => tab.fullPath));
    expect(windows.routeTabs.value).toEqual([]);
    expect(windows.state(first.fullPath).pinned).toBe(true);
    await router.push('/drafts/3');
    await windows.restore(first.fullPath);
    expect(windows.routeTabs.value.map(tab => tab.fullPath)).toEqual([first.fullPath, '/drafts/3']);
    expect(windows.routeTabs.value[0]).toBe(first);
    expect(first.revision).toBe(0);
  });
  it('pins without refreshing or closing and keeps independent geometry and aliases', async () => {
    const { workspace, router, windows } = await fixture();
    const one = workspace.tabs[0];
    await windows.pin(one.fullPath);
    expect(workspace.tabs[0]).toBe(one);
    expect(one.revision).toBe(0);
    expect(router.currentRoute.value.fullPath).toBe('/launchpad');
    await router.push('/drafts/2?channel=support');
    await windows.pin('/drafts/2?channel=support');
    windows.state(one.fullPath).alias = 'Sales review';
    windows.state(one.fullPath).rect.width = 420;
    expect(windows.title(one)).toBe('Sales review');
    expect(windows.state('/drafts/2?channel=support').rect.width).toBe(760);
    expect(workspace.cacheNames).toEqual(['/drafts/1?channel=sales::0', '/drafts/2?channel=support::0']);
  });
  it('focuses an existing pinned route instead of navigating or duplicating it', async () => {
    const { workspace, router, windows } = await fixture();
    const path = workspace.tabs[0].fullPath;
    await windows.pin(path);
    const focus = windows.state(path).focusVersion;
    const failure = await router.push(path);
    expect(isNavigationFailure(failure)).toBe(true);
    expect(router.currentRoute.value.fullPath).toBe('/launchpad');
    expect(windows.state(path).focusVersion).toBe(focus + 1);
    expect(workspace.tabs).toHaveLength(1);
  });
  it('keeps a window pinned after blocked restore and retains its alias after successful restore', async () => {
    const { workspace, router, windows } = await fixture();
    const tab = workspace.tabs[0];
    await windows.pin(tab.fullPath);
    windows.state(tab.fullPath).alias = 'Review';
    const unblock = router.beforeEach(to => to.fullPath === tab.fullPath ? false : undefined);
    await windows.restore(tab.fullPath);
    expect(windows.state(tab.fullPath).pinned).toBe(true);
    unblock();
    await windows.restore(tab.fullPath);
    expect(windows.state(tab.fullPath).pinned).toBe(false);
    expect(windows.title(tab)).toBe('Review');
    expect(workspace.tabs[0]).toBe(tab);
    expect(tab.revision).toBe(0);
  });
  it('releases window metadata on close and keeps refresh revisions separate from placement', async () => {
    const { workspace, router, windows } = await fixture();
    const path = workspace.tabs[0].fullPath;
    await windows.pin(path);
    const state = windows.state(path);
    workspace.refresh(path);
    expect(windows.state(path)).toBe(state);
    expect(state.pinned).toBe(true);
    expect(workspace.cacheNames).toEqual([`${path}::1`]);
    await windows.close(path);
    await nextTick();
    expect(workspace.tabs).toHaveLength(0);
    expect(windows.states.has(path)).toBe(false);
    expect(router.currentRoute.value.fullPath).toBe('/launchpad');
  });
});
