import type { ArenaLocale } from "../../shared/i18n/format";
import { parseJsonPayload } from "../../shared/jsonPayload";
import type { Battle } from "./battles";

export type BattleLocaleSlice = {
  question: string;
  category: string;
  builderView: string;
  breakerView: string;
  judgeQuestions: string[];
  reveal: string;
};

export type BattleLocales = {
  en?: BattleLocaleSlice;
  zh?: BattleLocaleSlice;
};

export type BattleWithLocales = Battle & {
  locales?: BattleLocales;
};

export type DisciplineBattleBilingual = {
  en: BattleLocaleSlice;
  zh: BattleLocaleSlice;
};

function pickLocaleBlock(
  root: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (root[key] != null && typeof root[key] === "object") {
      return root[key];
    }
  }
  const lower = keys.map((k) => k.toLowerCase());
  for (const [k, v] of Object.entries(root)) {
    if (lower.includes(k.toLowerCase()) && v != null && typeof v === "object") {
      return v;
    }
  }
  return undefined;
}

function normalizeSlice(raw: unknown): BattleLocaleSlice | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const judgeRaw = o.judgeQuestions ?? o.judge_questions;
  const judgeQuestions = Array.isArray(judgeRaw)
    ? judgeRaw.map((q) => String(q).trim()).filter(Boolean)
    : [];
  const slice: BattleLocaleSlice = {
    question: String(o.question ?? "").trim(),
    category: String(o.category ?? "General").trim(),
    builderView: String(o.builderView ?? o.builder_view ?? "").trim(),
    breakerView: String(o.breakerView ?? o.breaker_view ?? "").trim(),
    judgeQuestions,
    reveal: String(o.reveal ?? "").trim(),
  };
  return isBattleLocaleSlice(slice) ? slice : null;
}

/** 解析模型返回的学科辩论 JSON（后端已解析时可直接传入 battle 对象） */
export function parseDisciplineBattleBilingual(
  raw: string | DisciplineBattleBilingual | Record<string, unknown> | null | undefined
): DisciplineBattleBilingual | null {
  if (!raw) return null;
  if (typeof raw === "object" && "en" in raw && "zh" in raw) {
    const en = normalizeSlice((raw as DisciplineBattleBilingual).en);
    const zh = normalizeSlice((raw as DisciplineBattleBilingual).zh);
    if (en && zh) return { en, zh };
    return null;
  }
  const parsed = parseJsonPayload<Record<string, unknown>>(
    typeof raw === "string" ? raw : JSON.stringify(raw)
  );
  if (!parsed) return null;
  let en = pickLocaleBlock(parsed, "en", "english");
  let zh = pickLocaleBlock(parsed, "zh", "chinese", "cn");
  if (!en && !zh) {
    const single = normalizeSlice(parsed);
    if (single) return { en: single, zh: single };
  }
  const enSlice = normalizeSlice(en);
  const zhSlice = normalizeSlice(zh);
  if (enSlice && zhSlice) return { en: enSlice, zh: zhSlice };
  return null;
}

export function isBattleLocaleSlice(value: unknown): value is BattleLocaleSlice {
  if (!value || typeof value !== "object") return false;
  const v = value as BattleLocaleSlice;
  return (
    typeof v.question === "string" &&
    typeof v.category === "string" &&
    typeof v.builderView === "string" &&
    typeof v.breakerView === "string" &&
    typeof v.reveal === "string" &&
    Array.isArray(v.judgeQuestions) &&
    v.judgeQuestions.length >= 3
  );
}

/** AI 对局含双语时按当前语言取文案；静态 catalog 对局仍用扁平字段 */
export function battleForLocale(battle: BattleWithLocales, locale: ArenaLocale): Battle {
  const slice = battle.locales?.[locale];
  if (slice) {
    return { ...battle, ...slice };
  }
  return battle;
}
