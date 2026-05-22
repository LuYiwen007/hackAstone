import type { ArenaLocale } from "../../shared/i18n/format";
import { parseJsonPayload } from "../../shared/jsonPayload";
import { finalizeRoundtableSpeech, roundtableStreamDisplayText } from "./roundtableLocale";

export type DisciplineChoice = "builder" | "breaker" | "uncertain";

export type DisciplineMessageRole = "user" | "builder" | "breaker";

export type DisciplineStoredMessage = {
  id: string;
  role: DisciplineMessageRole;
  content: string;
  timestamp: number;
};

export type DisciplineSummaryBilingual = {
  en: { summary: string };
  zh: { summary: string };
};

const BUILDER_MARKER = /^\s*(?:\[Builder\]|【建构者】|建构者[:：])\s*/im;
const BREAKER_MARKER = /^\s*(?:\[Breaker\]|【破坏者】|破坏者[:：])\s*/im;

export function disciplineStreamDisplayText(accumulated: string): string {
  return roundtableStreamDisplayText(accumulated);
}

export function finalizeDisciplineSpeech(raw: string): string {
  return finalizeRoundtableSpeech(raw);
}

/** 解析不确定立场下的双段回复 */
export function parseDisciplineDualReply(
  raw: string,
  structured?: { builder?: string; breaker?: string } | null
): { builder: string; breaker: string } | null {
  if (structured?.builder?.trim() && structured?.breaker?.trim()) {
    return { builder: structured.builder.trim(), breaker: structured.breaker.trim() };
  }
  const text = finalizeDisciplineSpeech(raw);
  if (!text) return null;
  const builderIdx = text.search(BUILDER_MARKER);
  const breakerIdx = text.search(BREAKER_MARKER);
  if (builderIdx < 0 || breakerIdx < 0 || builderIdx >= breakerIdx) return null;
  const builderMatch = text.slice(builderIdx).match(BUILDER_MARKER);
  const breakerMatch = text.slice(breakerIdx).match(BREAKER_MARKER);
  if (!builderMatch || !breakerMatch) return null;
  const builderStart = builderIdx + builderMatch[0].length;
  const breakerStart = breakerIdx + breakerMatch[0].length;
  const builderText = text.slice(builderStart, breakerIdx).trim();
  const breakerText = text.slice(breakerStart).trim();
  if (!builderText || !breakerText) return null;
  return { builder: builderText, breaker: breakerText };
}

function pickLocaleBlock(
  root: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (root[key] != null && typeof root[key] === "object") {
      return root[key];
    }
  }
  return undefined;
}

function summaryFromSlice(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const s = String(o.summary ?? o.reveal ?? o.fullExplanation ?? "").trim();
  return s || null;
}

export function parseDisciplineSummaryBilingual(
  raw: string | DisciplineSummaryBilingual | Record<string, unknown> | null | undefined
): DisciplineSummaryBilingual | null {
  if (!raw) return null;
  if (typeof raw === "object" && "en" in raw && "zh" in raw) {
    const en = summaryFromSlice((raw as DisciplineSummaryBilingual).en);
    const zh = summaryFromSlice((raw as DisciplineSummaryBilingual).zh);
    if (en && zh) return { en: { summary: en }, zh: { summary: zh } };
    return null;
  }
  const parsed =
    typeof raw === "string"
      ? parseJsonPayload<Record<string, unknown>>(raw)
      : (raw as Record<string, unknown>);
  if (!parsed) return null;
  const enBlock = pickLocaleBlock(parsed, "en", "english");
  const zhBlock = pickLocaleBlock(parsed, "zh", "chinese", "cn");
  const en = summaryFromSlice(enBlock) ?? summaryFromSlice(parsed);
  const zh = summaryFromSlice(zhBlock) ?? summaryFromSlice(parsed);
  if (en && zh) return { en: { summary: en }, zh: { summary: zh } };
  return null;
}

export function disciplineSummaryForLocale(
  summary: DisciplineSummaryBilingual,
  locale: ArenaLocale
): string {
  return locale === "en" ? summary.en.summary : summary.zh.summary;
}

export function buildDisciplineHistory(
  messages: DisciplineStoredMessage[],
  t: (key: string) => string
): string {
  return messages
    .map((m) => {
      const who =
        m.role === "user"
          ? t("discipline.battle.history.user")
          : m.role === "builder"
            ? "Builder"
            : "Breaker";
      return `${who}: ${m.content}`;
    })
    .join("\n");
}

export function disciplineRoleLabel(
  role: DisciplineMessageRole,
  t: (key: string) => string
): string {
  if (role === "user") return t("discipline.battle.you");
  if (role === "builder") return "Builder";
  return "Breaker";
}
