import Mock from "mockjs";
import type { Order } from "./contracts";
import { t, departmentLabel } from "../i18n";
import type {
  Dashboard,
  Envelope,
  MapData,
  Session,
  User,
  UserInput,
} from "./contracts";
const random = Mock.Random;
let users: User[] = Array.from({ length: 128 }, (_, i) => ({
  id: i + 1,
  name: random.cname(),
  email: random.email("example.com"),
  role: i % 7 === 0 ? "admin" : i % 3 === 0 ? "editor" : "viewer",
  status: i % 6 === 0 ? "disabled" : "active",
  department: random.pick(["design", "engineering", "marketing", "success"]),
  createdAt: random.date("yyyy-MM-dd"),
}));
let nextId = 129;
const orders: Order[] = Array.from({ length: 86 }, (_, i) => {
  const items = Array.from({ length: random.integer(1, 3) }, () => ({
    name: random.pick(["Sax Cloud Pro", "Team Workspace", "Analytics Pack"]),
    quantity: random.integer(1, 5),
    price: random.pick([199, 499, 999]),
  }));
  return {
    id: i + 1,
    number: `SO-2026-${String(i + 1).padStart(5, "0")}`,
    customer: random.cname(),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: random.pick(["pending", "paid", "shipped", "completed"]),
    date: new Date(Date.now() - random.integer(0, 90) * 86400000)
      .toISOString()
      .slice(0, 10),
    items,
  };
});
const sessions = new Map<string, Session>();
// Demo sessions are recoverable across page reloads; production authentication is server-owned.
const roleForToken = (token: string) =>
  token === "mock-admin-session"
    ? "admin"
    : token === "mock-viewer-session"
      ? "viewer"
      : sessions.get(token)?.role;
export function createDashboard(): Dashboard {
  const trend = () => Array.from({ length: 12 }, () => random.integer(20, 90));
  return {
    metrics: [
      {
        label: "metric.revenue",
        value: random.integer(126000, 138000),
        change: 18.6,
        unit: "¥",
        trend: trend(),
      },
      {
        label: "metric.users",
        value: random.integer(8200, 8900),
        change: 12.8,
        unit: "",
        trend: trend(),
      },
      {
        label: "metric.orders",
        value: random.integer(2300, 2600),
        change: 8.2,
        unit: "",
        trend: trend(),
      },
      {
        label: "metric.conversion",
        value: 4.86,
        change: 2.4,
        unit: "%",
        trend: trend(),
      },
    ],
    revenue: Array.from({ length: 30 }, (_, i) => [
      i + 1,
      random.integer(2200, 7000),
    ]),
    previousRevenue: Array.from({ length: 30 }, (_, i) => [
      i + 1,
      random.integer(1600, 4300),
    ]),
    channels: [
      { name: "channel.search", value: 42, color: "#3b82f6" },
      { name: "channel.direct", value: 28, color: "#8b5cf6" },
      { name: "channel.social", value: 18, color: "#22c9a5" },
      { name: "channel.other", value: 12, color: "#f6b74b" },
    ],
    activities: Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: random.cname(),
      action: random.pick([
        "activity.order",
        "activity.release",
        "activity.user",
      ]),
      minutes: random.integer(2, 50),
      type: random.pick(["user", "release", "order"]),
    })),
  };
}
const cities: [string, number, number][] = [
  ["Shanghai", 121.47, 31.23],
  ["Beijing", 116.4, 39.9],
  ["Shenzhen", 114.06, 22.55],
  ["Hangzhou", 120.15, 30.28],
  ["Chengdu", 104.06, 30.67],
  ["Wuhan", 114.3, 30.59],
  ["Xian", 108.94, 34.34],
  ["Nanjing", 118.8, 32.06],
  ["Guangzhou", 113.26, 23.13],
  ["Chongqing", 106.55, 29.56],
  ["Suzhou", 120.58, 31.3],
  ["Changsha", 112.94, 28.23],
];
export function createMapData(): MapData {
  const points = cities.map(([name, lon, lat], id) => ({
    id,
    name,
    position: [lon, lat] as [number, number],
    value: random.integer(100, 1800),
  }));
  return {
    points,
    flows: points.slice(1).map((p) => ({
      source: points[0]!.position,
      target: p.position,
      name: `Shanghai → ${p.name}`,
      value: random.integer(50, 500),
    })),
  };
}
function json<T>(data: T, status = 200, message = "ok") {
  return new Response(
    JSON.stringify({
      code: status === 200 ? 0 : status,
      message,
      data,
    } satisfies Envelope<T>),
    { status, headers: { "Content-Type": "application/json" } },
  );
}
function validUser(value: unknown): value is UserInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    v.name.trim().length > 0 &&
    typeof v.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) &&
    ["admin", "editor", "viewer"].includes(String(v.role)) &&
    ["active", "disabled"].includes(String(v.status)) &&
    typeof v.department === "string" &&
    v.department.trim().length > 0
  );
}
export const mockFetch: typeof fetch = async (input, init) => {
  const url = new URL(
    input instanceof Request ? input.url : String(input),
    window.location.origin,
  );
  const method = init?.method?.toUpperCase() || "GET";
  await new Promise((resolve) =>
    setTimeout(resolve, 180 + random.integer(0, 180)),
  );
  let body: Record<string, unknown> = {};
  try {
    body = init?.body ? JSON.parse(String(init.body)) : {};
  } catch {
    return json(null, 400, t("error.format"));
  }
  if (url.pathname.endsWith("/auth/login") && method === "POST") {
    if (
      !["admin", "viewer"].includes(String(body.username)) ||
      body.password !== "123456"
    )
      return json(null, 401, t("error.login"));
    const role = body.username === "admin" ? "admin" : "viewer";
    const session: Session = {
      token: `mock-${role}-session`,
      name: role === "admin" ? "Alex Morgan" : "Guest",
      role,
    };
    sessions.set(session.token, session);
    return json(session);
  }
  const token =
    new Headers(init?.headers).get("Authorization")?.replace("Bearer ", "") ||
    "";
  const role = roleForToken(token);
  if (!role) return json(null, 401, t("error.expired"));
  if (url.pathname.endsWith("/orders") && method === "GET") {
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase(),
      status = url.searchParams.get("status") || "";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1),
      size = Math.min(
        100,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 10),
      );
    const items = orders.filter(
      (o) =>
        (!keyword ||
          `${o.number} ${o.customer}`.toLowerCase().includes(keyword)) &&
        (!status || o.status === status),
    );
    return json({
      items: items.slice((page - 1) * size, page * size),
      total: items.length,
    });
  }
  if (url.pathname.endsWith("/dashboard")) return json(createDashboard());
  if (url.pathname.endsWith("/analytics"))
    return json(
      Array.from({ length: 20000 }, (_, i) => [
        i,
        Math.sin(i / 230) * 25 + random.float(0, 15, 2, 2) + 55,
      ]),
    );
  if (url.pathname.endsWith("/map")) return json(createMapData());
  if (/\/users(?:\/\d+)?$/.test(url.pathname)) {
    const id = Number(url.pathname.split("/").at(-1));
    if (method === "GET") {
      const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
      const status = url.searchParams.get("status") || "";
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1),
        size = Math.min(
          100,
          Math.max(1, Number(url.searchParams.get("pageSize")) || 10),
        );
      const items = users.filter(
        (u) =>
          (!keyword ||
            `${u.name} ${u.email} ${u.department} ${departmentLabel(u.department)}`
              .toLowerCase()
              .includes(keyword)) &&
          (!status || u.status === status),
      );
      return json({
        items: items.slice((page - 1) * size, page * size),
        total: items.length,
      });
    }
    if (role !== "admin") return json(null, 403, t("error.permission"));
    if (method === "DELETE") {
      const existing = users.find((u) => u.id === id);
      if (!existing) return json(null, 404, t("error.missingUser"));
      users = users.filter((u) => u.id !== id);
      return json(null);
    }
    if (!validUser(body)) return json(null, 422, t("error.userInput"));
    if (users.some((u) => u.email === body.email && u.id !== id))
      return json(null, 409, t("error.duplicateEmail"));
    if (method === "POST") {
      const user: User = {
        ...body,
        id: nextId++,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      users.unshift(user);
      return json(user);
    }
    if (method === "PUT") {
      const index = users.findIndex((u) => u.id === id);
      if (index < 0) return json(null, 404, t("error.missingUser"));
      users[index] = { ...users[index]!, ...body };
      return json(users[index]);
    }
  }
  return json(null, 404, t("error.endpoint"));
};
