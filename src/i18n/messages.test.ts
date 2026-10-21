import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { en, zh } from "./messages";

describe("localized messages", () => {
  for (const [language, messages] of [["zh-CN", zh], ["en-US", en]] as const) {
    it(`compiles every ${language} message and interpolates package names`, () => {
      const instance = createI18n({
        legacy: false,
        locale: language,
        flatJson: true,
        warnHtmlMessage: false,
        messages: { [language]: { ...messages } },
      });
      for (const key of Object.keys(messages)) {
        expect(() => instance.global.t(key), `${language}: ${key}`).not.toThrow();
      }
      expect(instance.global.t("icons.dockerStart", { package: "@iconify-json/lucide" })).toContain("@iconify-json/lucide");
      instance.dispose();
    });
  }
});
