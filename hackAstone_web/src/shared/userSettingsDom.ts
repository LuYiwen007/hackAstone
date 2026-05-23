import type { UserSettings } from "./api/userSettings";

/** 将用户设置应用到 document，供全局 CSS 消费 */
export function applyUserSettingsToDocument(settings: UserSettings) {
  const html = document.documentElement;
  html.dataset.arenaTheme = settings.appearance.theme;
  html.classList.toggle("arena-compact", settings.preferences.compact);
  html.classList.toggle("arena-no-animations", !settings.preferences.animations);
  html.lang = settings.locale === "zh" ? "zh-CN" : "en";
}
