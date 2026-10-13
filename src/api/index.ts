import { http } from "./client";
export { menusApi } from "./menus";
import type { Order, OrderQuery } from "./contracts";
export const ordersApi = {
  list: (query: OrderQuery) =>
    http.Get<PageResult<Order>>("/orders", { params: query }),
};
import type {
  Dashboard,
  LoginInput,
  MapData,
  PageResult,
  Session,
  User,
  UserInput,
  UserQuery,
} from "./contracts";
export const authApi = {
  login: (input: LoginInput) => http.Post<Session>("/auth/login", input),
};
export const dashboardApi = {
  overview: () => http.Get<Dashboard>("/dashboard"),
  analytics: () => http.Get<[number, number][]>("/analytics"),
  map: () => http.Get<MapData>("/map"),
};
export const usersApi = {
  list: (query: UserQuery) =>
    http.Get<PageResult<User>>("/users", { params: query }),
  create: (input: UserInput) => http.Post<User>("/users", input),
  update: (id: User["id"], input: UserInput) =>
    http.Put<User>(`/users/${id}`, input),
  remove: (id: User["id"]) => http.Delete<null>(`/users/${id}`),
};
export type ApiResult<T extends (...args: never[]) => unknown> = Awaited<
  ReturnType<T>
>;
