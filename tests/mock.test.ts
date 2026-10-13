import { beforeAll, describe, expect, it, vi } from "vitest";
import type {
  Envelope,
  PageResult,
  Session,
  User,
  UserInput,
} from "../src/api/contracts";
import { mockFetch } from "../src/api/mock";
beforeAll(() =>
  vi.stubGlobal("window", { location: { origin: "http://localhost:7869" } }),
);
async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  token = "mock-admin-session",
) {
  const response = await mockFetch(`/api${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    body: (await response.json()) as Envelope<T>,
  };
}
describe("Mock HTTP contracts", () => {
  it("validates credentials and rejects unauthenticated access", async () => {
    expect(
      (
        await request(
          "/auth/login",
          "POST",
          { username: "admin", password: "incorrect" },
          "",
        )
      ).status,
    ).toBe(401);
    const session = await request<Session>(
      "/auth/login",
      "POST",
      { username: "admin", password: "123456" },
      "",
    );
    expect(session.body.data.role).toBe("admin");
    expect((await request("/users", "GET", undefined, "invalid")).status).toBe(
      401,
    );
  });
  it("paginates and filters the same data set", async () => {
    const first = await request<PageResult<User>>("/users?page=1&pageSize=10"),
      second = await request<PageResult<User>>("/users?page=2&pageSize=10");
    expect(first.body.data.items).toHaveLength(10);
    expect(first.body.data.total).toBe(128);
    expect(first.body.data.items[0]?.id).not.toBe(
      second.body.data.items[0]?.id,
    );
    const filtered = await request<PageResult<User>>(
      "/users?status=disabled&pageSize=100",
    );
    expect(filtered.body.data.items.every((u) => u.status === "disabled")).toBe(
      true,
    );
  });
  it("creates, updates, checks duplicates, and deletes a member", async () => {
    const input: UserInput = {
      name: "契约测试",
      email: "contract-test@example.com",
      department: "研发中心",
      role: "editor",
      status: "active",
    };
    const created = await request<User>("/users", "POST", input);
    expect(created.body.data.id).toBeGreaterThan(128);
    expect((await request("/users", "POST", input)).status).toBe(409);
    const updated = await request<User>(
      `/users/${created.body.data.id}`,
      "PUT",
      { ...input, name: "已更新" },
    );
    expect(updated.body.data.name).toBe("已更新");
    expect(
      (await request(`/users/${created.body.data.id}`, "DELETE")).status,
    ).toBe(200);
    expect(
      (await request(`/users/${created.body.data.id}`, "DELETE")).status,
    ).toBe(404);
  });
  it("rejects invalid data and enforces read-only permissions on writes", async () => {
    expect((await request("/users", "POST", { name: "" })).status).toBe(422);
    for (const method of ["POST", "PUT", "DELETE"])
      expect(
        (
          await request(
            "/users/1",
            method,
            { name: "unauthorized" },
            "mock-viewer-session",
          )
        ).status,
      ).toBe(403);
    expect(
      (await request("/users", "GET", undefined, "mock-viewer-session")).status,
    ).toBe(200);
  });
});
