import { beforeAll, describe, expect, it, vi } from "vitest";
import { mockFetch } from "../src/api/mock";
import type { Envelope, Order, PageResult } from "../src/api/contracts";
beforeAll(() =>
  vi.stubGlobal("window", { location: { origin: "http://localhost:7869" } }),
);
async function list(query: string, token = "mock-admin-session") {
  const response = await mockFetch(`/api/orders?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    status: response.status,
    data: ((await response.json()) as Envelope<PageResult<Order>>).data,
  };
}
describe("Order demo data contract", () => {
  it("paginates records and totals their detail items consistently", async () => {
    const first = await list("page=1&pageSize=10"),
      second = await list("page=2&pageSize=10");
    expect(first.data.total).toBe(86);
    expect(first.data.items).toHaveLength(10);
    expect(
      new Set([...first.data.items, ...second.data.items].map((o) => o.id))
        .size,
    ).toBe(20);
    for (const order of first.data.items)
      expect(order.total).toBe(
        order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      );
  });
  it("applies number and status filters and requires authentication", async () => {
    const result = await list("keyword=SO-2026-00001");
    expect(result.data.total).toBe(1);
    const status = await list("status=completed&pageSize=100");
    expect(status.data.items.every((o) => o.status === "completed")).toBe(true);
    expect((await list("page=1", "expired")).status).toBe(401);
  });
});
