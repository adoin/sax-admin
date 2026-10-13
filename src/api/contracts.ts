export type Role = "admin" | "editor" | "viewer";
export type OrderStatus = "pending" | "paid" | "shipped" | "completed";
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}
export interface Order {
  id: number;
  number: string;
  customer: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: OrderItem[];
}
export interface OrderQuery {
  keyword: string;
  status: string;
  page: number;
  pageSize: number;
}
export type UserStatus = "active" | "disabled";
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: string;
  createdAt: string;
}
export type UserInput = Pick<
  User,
  "name" | "email" | "role" | "status" | "department"
>;
export interface UserQuery {
  keyword: string;
  status: string;
  page: number;
  pageSize: number;
}
export interface PageResult<T> {
  items: T[];
  total: number;
}
export interface LoginInput {
  username: string;
  password: string;
}
export interface Session {
  token: string;
  name: string;
  role: Role;
}
export interface Metric {
  label:
    "metric.revenue" | "metric.users" | "metric.orders" | "metric.conversion";
  value: number;
  change: number;
  unit: string;
  trend: number[];
}
export interface Activity {
  id: number;
  name: string;
  action: "activity.order" | "activity.release" | "activity.user";
  minutes: number;
  type: "user" | "release" | "order";
}
export interface Dashboard {
  metrics: Metric[];
  revenue: [number, number][];
  previousRevenue: [number, number][];
  channels: {
    name:
      "channel.search" | "channel.direct" | "channel.social" | "channel.other";
    value: number;
    color: string;
  }[];
  activities: Activity[];
}
export interface MapPoint {
  id: number;
  name: string;
  position: [number, number];
  value: number;
}
export interface MapFlow {
  source: [number, number];
  target: [number, number];
  name: string;
  value: number;
}
export interface MapData {
  points: MapPoint[];
  flows: MapFlow[];
}
export interface Envelope<T> {
  code: number;
  message: string;
  data: T;
}
