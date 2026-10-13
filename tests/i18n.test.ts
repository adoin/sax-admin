import { afterEach, describe, expect, it } from "vitest";
import { en, zh } from "../src/i18n/messages";
import { locale, t, cityLabel, departmentLabel } from "../src/i18n";
afterEach(() => {
  locale.value = "zh-CN";
});
describe("Chinese and English localization", () => {
  it("ships matching non-empty dictionaries and interpolation parameters", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
    for (const key of Object.keys(zh) as (keyof typeof zh)[]) {
      expect(en[key].trim().length).toBeGreaterThan(0);
      expect(en[key].match(/\{\w+\}/g) || []).toEqual(
        zh[key].match(/\{\w+\}/g) || [],
      );
    }
  });
  it("switches page copy, configuration labels, and geographic labels", () => {
    locale.value = "zh-CN";
    expect(t("nav.users")).toBe("用户管理");
    expect(cityLabel("Shanghai")).toBe("上海");
    locale.value = "en-US";
    expect(t("nav.users")).toBe("Members");
    expect(cityLabel("Shanghai")).toBe("Shanghai");
    expect(departmentLabel("engineering")).toBe("Engineering");
    expect(t("users.edit", { name: "Alex" })).toBe("Edit Alex");
  });
});
