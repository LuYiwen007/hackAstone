export type ArenaLocale = "en" | "zh";

export const DEFAULT_LOCALE: ArenaLocale = "en";
export const LOCALE_STORAGE_KEY = "arena-locale";

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
