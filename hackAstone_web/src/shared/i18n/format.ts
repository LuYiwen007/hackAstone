export type ArenaLocale = "en" | "zh";

export const DEFAULT_LOCALE: ArenaLocale = "en";
/** Bumped so first-time visitors default to English (ignore legacy v1/v2 zh). */
export const LOCALE_STORAGE_KEY = "arena-locale-v3";
/** Set when user changes language in Settings (then server locale is authoritative). */
export const LOCALE_USER_SET_KEY = "arena-locale-user-set";

export function normalizeLocale(raw: string | null | undefined): ArenaLocale {
  if (!raw) return DEFAULT_LOCALE;
  const l = raw.trim().toLowerCase();
  return l.startsWith("zh") ? "zh" : "en";
}

export function readStoredLocale(): ArenaLocale {
  try {
    return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** 用户是否在设置里明确选过界面语言 */
export function hasUserChosenLocale(): boolean {
  try {
    return localStorage.getItem(LOCALE_USER_SET_KEY) === "1";
  } catch {
    return false;
  }
}

export function markUserChosenLocale() {
  try {
    localStorage.setItem(LOCALE_USER_SET_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Web：未在设置中选过语言时一律英文；选过后才用服务端/本地记录 */
export function resolveWebLocale(settingsLocale?: ArenaLocale | null): ArenaLocale {
  if (hasUserChosenLocale() && settingsLocale) {
    return normalizeLocale(settingsLocale);
  }
  return DEFAULT_LOCALE;
}

/** 简单占位符：{name} → vars.name */
export function formatMessage(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = vars[key];
    return v === undefined ? `{${key}}` : String(v);
  });
}
