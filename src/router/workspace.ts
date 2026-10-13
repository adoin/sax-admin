import { nextTick } from "vue";
import type { Router } from "vue-smart-router";
import { pinia } from "@/stores";
import { workspaceStore } from "@/stores/workspace";

export function registerDraftRoute(router: Router) {
  if (router.hasRoute("workspace-draft")) return;
  router.addRoute("admin", {
    path: "drafts/:id",
    name: "workspace-draft",
    component: () => import("@/pages/DraftPage.vue"),
    props: true,
    meta: { title: "workspace.draft" },
  });
}
export async function removeDraftRoute(router: Router) {
  const workspace = workspaceStore(pinia);
  if (router.currentRoute.value.name === "workspace-draft") {
    const failure = await router.replace("/workspace");
    if (failure) return;
  }
  workspace.retain(workspace.tabs.filter((tab) => !tab.fullPath.startsWith("/drafts/")).map((tab) => tab.fullPath));
  await nextTick();
  router.removeRoute("workspace-draft");
  workspace.editorEnabled = false;
}
