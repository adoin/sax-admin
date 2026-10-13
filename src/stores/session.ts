import { defineStore } from "pinia";
import type { Session } from "@/api/contracts";
function readSession(): Session | null {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem("sax-session") || "null",
    );
    if (
      value &&
      typeof value === "object" &&
      "token" in value &&
      "name" in value &&
      "role" in value &&
      typeof value.token === "string" &&
      typeof value.name === "string" &&
      ["admin", "editor", "viewer"].includes(String(value.role))
    )
      return value as Session;
  } catch {
    sessionStorage.removeItem("sax-session");
  }
  return null;
}
export const sessionStore = defineStore("session", {
  state: () => ({ current: readSession() }),
  getters: {
    authenticated: (state) => Boolean(state.current?.token),
    isAdmin: (state) => state.current?.role === "admin",
  },
  actions: {
    set(value: Session) {
      this.current = value;
      sessionStorage.setItem("sax-session", JSON.stringify(value));
    },
    clear() {
      this.current = null;
      sessionStorage.removeItem("sax-session");
    },
  },
});
