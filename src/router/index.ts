import { createRouter, createWebHistory } from "vue-smart-router";
import { pinia } from "@/stores";
import { sessionStore } from "@/stores/session";
import { workspaceStore } from "@/stores/workspace";
import { registerDraftRoute } from "./workspace";
export { navigation } from "./navigation";
export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/LoginPage.vue"),
      meta: { public: true, title: "login.title" },
    },
    {
      path: "/",
      name: "admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      redirect: "/dashboard",
      children: [
        { path: 'launchpad', name: 'workspace-empty', component: () => import('@/pages/EmptyWorkspacePage.vue'), meta: { title: 'workspace.emptyTitle', tabless: true } },
        { path: 'roles', name: 'roles', component: () => import('@/pages/RolesPage.vue'), meta: { title: 'nav.roles' } },
        { path: 'departments', name: 'departments', component: () => import('@/pages/DepartmentsPage.vue'), meta: { title: 'nav.departments' } },
        { path: 'dictionaries', name: 'dictionaries', component: () => import('@/pages/DictionariesPage.vue'), meta: { title: 'nav.dictionaries' } },
        { path: 'audit', name: 'audit', component: () => import('@/pages/AuditPage.vue'), meta: { title: 'nav.audit' } },
        { path: 'table-lab', name: 'table-lab', component: () => import('@/pages/TableLabPage.vue'), meta: { title: 'nav.tableLab' } },
        { path: 'card-lab', name: 'card-lab', component: () => import('@/pages/CardLabPage.vue'), meta: { title: 'nav.cardLab' } },
        { path: 'agent', name: 'agent', component: () => import('@/pages/AgentPage.vue'), meta: { title: 'nav.agent' } },
        { path: 'virtual', name: 'virtual', component: () => import('@/pages/VirtualPage.vue'), meta: { title: 'nav.virtual' } },
        { path: 'files', name: 'files', component: () => import('@/pages/FilesPage.vue'), meta: { title: 'nav.files' } },
        { path: "menus", name: "menus", component: () => import("@/pages/MenusPage.vue"), meta: { title: "nav.menus" } },
        {
          path: "icons",
          name: "icons",
          component: () => import("@/pages/IconsPage.vue"),
          meta: { title: "nav.icons" },
        },
        {
          path: "workspace",
          name: "workspace",
          component: () => import("@/pages/WorkspacePage.vue"),
          meta: { title: "nav.workspace" },
        },
        {
          path: "orders",
          name: "orders",
          component: () => import("@/pages/OrdersPage.vue"),
          meta: { title: "nav.orders" },
        },
        {
          path: "projects",
          name: "projects",
          component: () => import("@/pages/ProjectsPage.vue"),
          meta: { title: "nav.projects" },
        },
        {
          path: "forms",
          name: "forms",
          component: () => import("@/pages/FormsPage.vue"),
          meta: { title: "nav.forms" },
        },
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/pages/DashboardPage.vue"),
          meta: { title: "nav.dashboard" },
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/pages/UsersPage.vue"),
          meta: { title: "nav.users" },
        },
        {
          path: "charts",
          name: "charts",
          component: () => import("@/pages/ChartsPage.vue"),
          meta: { title: "nav.charts" },
        },
        {
          path: "maps",
          name: "maps",
          component: () => import("@/pages/MapsPage.vue"),
          meta: { title: "nav.maps" },
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/pages/SettingsPage.vue"),
          meta: { title: "nav.settings" },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      component: () => import("@/pages/NotFoundPage.vue"),
      meta: { public: true, title: "notFound.title" },
    },
  ],
});
registerDraftRoute(router);
router.afterEach((to, _from, failure) => {
  if (!failure) workspaceStore(pinia).visit(to);
});
router.beforeEach((to) => {
  if (!to.meta.public && !sessionStore(pinia).authenticated)
    return { name: "login", query: { redirect: to.fullPath } };
  if (to.name === "login" && sessionStore(pinia).authenticated)
    return "/dashboard";
});
