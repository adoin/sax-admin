import { createAlova } from "alova";
import adapterFetch from "alova/fetch";
import { mockFetch } from "./mock";
import { sessionStore } from "@/stores/session";
import { pinia } from "@/stores";
import type { Envelope } from "./contracts";
import { locale, t } from "@/i18n";
export const mockEnabled = import.meta.env.VITE_MOCK_ENABLED !== "false";
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export const http = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  requestAdapter: adapterFetch({
    customFetch: mockEnabled ? mockFetch : fetch,
  }),
  timeout: 15000,
  cacheFor: { GET: 0 },
  beforeRequest(method) {
    method.config.headers["Accept-Language"] = locale.value;
    const token = sessionStore(pinia).current?.token;
    if (token) method.config.headers.Authorization = `Bearer ${token}`;
  },
  responded: async (response) => {
    const body: Envelope<unknown> = await response.json();
    if (!response.ok || body.code !== 0) {
      if (response.status === 401) {
        sessionStore(pinia).clear();
        const base = import.meta.env.BASE_URL;
        const current = `${window.location.pathname.slice(base.length - 1)}${window.location.search}`;
        if (!current.startsWith("/login")) window.location.assign(`${base}login?redirect=${encodeURIComponent(current)}`);
      }
      throw new ApiError(
        body.message || t("error.request"),
        body.code || response.status,
      );
    }
    return body.data;
  },
});
