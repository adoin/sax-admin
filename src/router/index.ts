import { createRouter, createWebHistory } from "vue-smart-router";
import { pinia } from "@/stores";
import { sessionStore } from "@/stores/session";
export const navigation = [
  {
    path: "/dashboard",
    label: "nav.dashboard",
    icon: "LayoutDashboard",
    section: "section.workspace",
    caption: "dashboard.caption",
  },
  {
    path: "/users",
    label: "nav.users",
    icon: "Users",
    section: "section.workspace",
    caption: "users.caption",
  },
  {
    path: "/charts",
    label: "nav.charts",
    icon: "ChartNoAxesCombined",
    section: "section.insights",
    caption: "charts.caption",
  },
  {
    path: "/maps",
    label: "nav.maps",
    icon: "Map",
    section: "section.insights",
    caption: "maps.caption",
  },
  {
    path: "/settings",
    label: "nav.settings",
    icon: "Settings2",
    section: "section.system",
    caption: "settings.caption",
  },
] as const;
export const router = createRouter({
  history: createWebHistory(),
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
      component: () => import("@/layouts/AdminLayout.vue"),
      redirect: "/dashboard",
      children: [
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
router.beforeEach((to) => {
  if (!to.meta.public && !sessionStore(pinia).authenticated)
    return { name: "login", query: { redirect: to.fullPath } };
  if (to.name === "login" && sessionStore(pinia).authenticated)
    return "/dashboard";
});
