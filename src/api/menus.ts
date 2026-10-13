import { http } from "./client";
import type { AdminMenu, MenuInput } from "./menu-contracts";
export const menusApi = {
  list: () => http.Get<AdminMenu[]>("/menus"),
  create: (input: MenuInput) => http.Post<AdminMenu>("/menus", input),
  update: (id: string, input: MenuInput) => http.Put<AdminMenu>(`/menus/${encodeURIComponent(id)}`, input),
  remove: (id: string) => http.Delete<null>(`/menus/${encodeURIComponent(id)}`),
};
