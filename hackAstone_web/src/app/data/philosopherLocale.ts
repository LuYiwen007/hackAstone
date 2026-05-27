import type { ArenaLocale } from "../../shared/i18n/format";
import type { Philosopher } from "./philosophers";

export type PhilosopherLocaleSlice = {
  school: string;
  summary?: string;
  birthPlace?: string;
  lifespan?: string;
  keyIdeas: string[];
  majorWorks?: string[];
  famousQuotes?: string[];
};

export type PhilosopherLocales = {
  en?: PhilosopherLocaleSlice;
  zh?: PhilosopherLocaleSlice;
};

export type PhilosopherWithLocales = Philosopher & {
  locales?: PhilosopherLocales;
};

function normalizeSlice(raw: unknown): PhilosopherLocaleSlice | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const keyIdeas = Array.isArray(o.keyIdeas)
    ? o.keyIdeas.map((x) => String(x).trim()).filter(Boolean)
    : [];
  if (!keyIdeas.length && !o.school) return null;
  return {
    school: String(o.school ?? "").trim(),
    summary: o.summary != null ? String(o.summary).trim() : undefined,
    birthPlace: o.birthPlace != null ? String(o.birthPlace).trim() : undefined,
    lifespan: o.lifespan != null ? String(o.lifespan).trim() : undefined,
    keyIdeas,
    majorWorks: Array.isArray(o.majorWorks)
      ? o.majorWorks.map((x) => String(x).trim()).filter(Boolean)
      : undefined,
    famousQuotes: Array.isArray(o.famousQuotes)
      ? o.famousQuotes.map((x) => String(x).trim()).filter(Boolean)
      : undefined,
  };
}

/** 含双语 locales 时按当前语言取学派、简介、著作等文案 */
export function philosopherForLocale(
  philosopher: PhilosopherWithLocales,
  locale: ArenaLocale
): Philosopher {
  const slice = philosopher.locales?.[locale];
  if (!slice) return philosopher;
  return { ...philosopher, ...slice };
}

export function isPhilosopherLocaleSlice(value: unknown): value is PhilosopherLocaleSlice {
  return normalizeSlice(value) != null;
}
