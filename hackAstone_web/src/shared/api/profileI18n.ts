import type { ArenaLocale } from "../i18n/format";
import { formatMessage } from "../i18n/format";

export type ProfileI18nSlice = {
  topic: string;
  userChoice: string;
  judgeSummary: string;
};

export type ProfileI18n = {
  en: ProfileI18nSlice;
  zh: ProfileI18nSlice;
};

export function buildProfileI18n(en: ProfileI18nSlice, zh: ProfileI18nSlice): ProfileI18n {
  return { en, zh };
}

/** 用指定语言的 i18n 表构造 t（用于保存双语快照） */
export function tFromStrings(
  strings: Record<string, string>
): (key: string, vars?: Record<string, string | number>) => string {
  return (key, vars) => {
    const template = strings[key];
    if (!template) return key;
    return formatMessage(template, vars);
  };
}

export function dilemmaOptionLabel(
  dilemmaId: string,
  optionId: string,
  strings: Record<string, string>
): string {
  return strings[`dilemma.case.${dilemmaId}.option.${optionId}.label`] ?? optionId;
}

export function dilemmaTopicTitle(
  dilemmaId: string,
  locale: ArenaLocale,
  strings: Record<string, string>,
  fallbackZh: string,
  fallbackEn: string
): string {
  const key = `dilemma.case.${dilemmaId}.title`;
  return strings[key] ?? (locale === "zh" ? fallbackZh : fallbackEn);
}
