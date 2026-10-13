import { createI18n } from "vue-i18n";
import { zh, en } from "./messages";
import type { MessageKey } from "./messages";
export type Locale = "zh-CN" | "en-US";
const saved =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("sax-locale")
    : null;
export const i18n = createI18n({
  legacy: false,
  locale: saved === "en-US" ? "en-US" : "zh-CN",
  fallbackLocale: "zh-CN",
  flatJson: true,
  messages: { "zh-CN": { ...zh }, "en-US": { ...en } },
});
export const locale = i18n.global.locale;
export const t = (
  key: MessageKey,
  values: Record<string, string | number> = {},
) => i18n.global.t(key, values);
export function setLocale(value: Locale) {
  locale.value = value;
  localStorage.setItem("sax-locale", value);
}
export function toggleLocale() {
  setLocale(locale.value === "zh-CN" ? "en-US" : "zh-CN");
}
export function departmentLabel(value: string) {
  const key = `department.${value}`;
  return key in zh ? t(key as MessageKey) : value;
}
export function cityLabel(value: string) {
  const key = `city.${value}`;
  return key in zh ? t(key as MessageKey) : value;
}
export function messageLabel(value: string) {
  return value in zh ? t(value as MessageKey) : value;
}
