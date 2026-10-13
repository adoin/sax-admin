import { beforeAll, describe, expect, it, vi } from "vitest";
import { authApi, usersApi } from "../src/api";
import { ApiError } from "../src/api/client";
import { sessionStore } from "../src/stores/session";
import { pinia } from "../src/stores";
import { locale } from "../src/i18n";
beforeAll(() => {
  const memory = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
  });
  vi.stubGlobal("window", {
    location: { origin: "http://localhost:7869", pathname: "/login" },
  });
});
describe("Alova client integration", () => {
  it("unwraps typed envelopes and sends the authenticated request", async () => {
    const session = await authApi.login({
      username: "admin",
      password: "123456",
    });
    sessionStore(pinia).set(session);
    const result = await usersApi.list({
      keyword: "",
      status: "",
      page: 1,
      pageSize: 5,
    });
    expect(result.items).toHaveLength(5);
    expect(result.total).toBe(128);
    expect(result).not.toHaveProperty("code");
  });
  it("propagates localized permission errors through the API method", async () => {
    locale.value = "en-US";
    sessionStore(pinia).set(
      await authApi.login({ username: "viewer", password: "123456" }),
    );
    try {
      await usersApi.remove(1);
      throw new Error("Expected rejection");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        code: 403,
        message: "This account does not have management permissions",
      });
    }
    locale.value = "zh-CN";
  });
  it("clears the session on an HTTP 401", async () => {
    sessionStore(pinia).set({
      token: "expired",
      name: "Expired",
      role: "viewer",
    });
    await expect(
      usersApi.list({ keyword: "", status: "", page: 1, pageSize: 5 }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(sessionStore(pinia).authenticated).toBe(false);
  });
});
