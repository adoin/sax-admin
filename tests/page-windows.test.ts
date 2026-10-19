import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { effectScope, nextTick } from 'vue';
import { createMemoryHistory, createRouter, isNavigationFailure } from 'vue-smart-router';
import { workspaceStore } from '../src/stores/workspace';
import { createPageWindowManager } from '../src/components/workspace/page-windows';

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
