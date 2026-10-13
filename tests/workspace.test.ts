import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-smart-router";
import { workspaceStore } from "../src/stores/workspace";

beforeEach(() => setActivePinia(createPinia()));
function testRouter() {
  return createRouter({ history: createMemoryHistory(), routes: [{ path: "/", name: "admin", component: {}, children: [
    { path: "dashboard", name: "dashboard", component: {}, meta: { title: "nav.dashboard" } },
    { path: "drafts/:id", name: "workspace-draft", component: {}, meta: { title: "workspace.draft" } },
  ] }] });
}
describe("workspace cache lifecycle", () => {
  it("keeps independent cache names for two instances of the same route", async () => {
    const router = testRouter(), workspace = workspaceStore();
    for (const path of ["/drafts/1", "/drafts/2", "/drafts/1"]) {
      await router.push(path);
      workspace.visit(router.currentRoute.value);
    }
    expect(workspace.tabs.map((tab) => tab.titleId)).toEqual([undefined, "1", "2"]);
    expect(workspace.cacheNames).toContain("/drafts/1::0");
    expect(workspace.cacheNames).toContain("/drafts/2::0");
    workspace.remove("/drafts/1");
    expect(workspace.cacheNames).not.toContain("/drafts/1::0");
    expect(workspace.cacheNames).toContain("/drafts/2::0");
  });
  it("refreshes only the selected tab and preserves the pinned home", async () => {
    const router = testRouter(), workspace = workspaceStore();
    await router.push("/drafts/1"); workspace.visit(router.currentRoute.value);
    workspace.refresh("/drafts/1");
    expect(workspace.cacheNames).toEqual(["/dashboard::0", "/drafts/1::1"]);
    workspace.remove("/dashboard");
    workspace.retain([]);
    expect(workspace.cacheNames).toEqual(["/dashboard::0"]);
    workspace.reset();
    expect(workspace.tabs).toHaveLength(1);
  });
});
