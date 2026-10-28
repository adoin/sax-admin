import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { preferencesStore } from "../src/stores/preferences";

const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  setActivePinia(createPinia());
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("attached sidebar tools preferences", () => {
  it("starts collapsed when no preference has been saved", () => {
    expect(preferencesStore().asideToolsCollapsed).toBe(true);
  });

  it("shares state and restores both choices after the store is recreated", () => {
    const preferences = preferencesStore();
    preferences.setAsideToolsCollapsed(false);
    expect(preferencesStore().asideToolsCollapsed).toBe(false);
    expect(storage.get("sax-aside-tools-collapsed")).toBe("false");
    setActivePinia(createPinia());
    const restored = preferencesStore();
    expect(restored.asideToolsCollapsed).toBe(false);
    restored.setAsideToolsCollapsed(true);
    setActivePinia(createPinia());
    expect(preferencesStore().asideToolsCollapsed).toBe(true);
    expect(storage.get("sax-aside-tools-collapsed")).toBe("true");
  });

  it("falls back to collapsed for an invalid saved value", () => {
    storage.set("sax-aside-tools-collapsed", "invalid");
    expect(preferencesStore().asideToolsCollapsed).toBe(true);
  });
});
