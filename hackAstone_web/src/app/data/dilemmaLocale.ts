import type { ArenaLocale } from "../../shared/i18n/format";
import { parseJsonPayload } from "../../shared/jsonPayload";
import type { Dilemma, DilemmaOption } from "./dilemmas";

export type DilemmaMessageRole = "user" | "philosopher" | "judge";

export type DilemmaMessageLocales = {
  en?: { content: string };
  zh?: { content: string };
};

/** 道德困境讨论消息：AI 含双语 locales；开场 Judge 用 i18nKey + choiceOptionId */
export type DilemmaStoredMessage = {
  id: string;
  role: DilemmaMessageRole;
  content?: string;
  locales?: DilemmaMessageLocales;
  i18nKey?: string;
  choiceOptionId?: string;
};

export type DilemmaTurnSlice = {
  philosopherReply: string;
  judgeQuestion: string;
  continueDebate: boolean;
};

export type DilemmaTurnBilingual = {
  en: DilemmaTurnSlice;
  zh: DilemmaTurnSlice;
};

export type DilemmaSummaryBilingual = {
  en: { fullExplanation: string };
  zh: { fullExplanation: string };
};

export function localizeDilemma(
  dilemma: Dilemma,
  t: (key: string, vars?: Record<string, string | number>) => string
): Dilemma {
  const prefix = `dilemma.case.${dilemma.id}`;
  const localizeOption = (opt: DilemmaOption): DilemmaOption => ({
    ...opt,
    label: t(`${prefix}.option.${opt.id}.label`),
    summary: t(`${prefix}.option.${opt.id}.summary`),
    stancePrompt: t(`${prefix}.option.${opt.id}.stancePrompt`),
  });
  return {
    ...dilemma,
    title: t(`${prefix}.title`),
    englishTitle: t(`${prefix}.englishTitle`),
    subtitle: t(`${prefix}.subtitle`),
    imageAlt: t(`${prefix}.imageAlt`),
    imageCaption: t(`${prefix}.imageCaption`),
    question: t(`${prefix}.question`),
    promptLead: t(`${prefix}.promptLead`),
    options: dilemma.options.map(localizeOption),
  };
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
  const lower = keys.map((k) => k.toLowerCase());
  for (const [k, v] of Object.entries(root)) {
    if (lower.includes(k.toLowerCase()) && v != null && typeof v === "object") {
      return v;
    }
  }
  return undefined;
}

function normalizeTurnSlice(raw: unknown): DilemmaTurnSlice | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const philosopherReply = String(o.philosopherReply ?? o.philosopher_reply ?? "").trim();
  const judgeQuestion = String(o.judgeQuestion ?? o.judge_question ?? "").trim();
  if (!philosopherReply || !judgeQuestion) return null;
  return {
    philosopherReply,
    judgeQuestion,
    continueDebate: o.continueDebate === false || o.continue_debate === false ? false : true,
  };
}

export function parseDilemmaTurnBilingual(
  raw: DilemmaTurnBilingual | Record<string, unknown> | string | null | undefined
): DilemmaTurnBilingual | null {
  if (!raw) return null;
  if (typeof raw === "object" && "en" in raw && "zh" in raw) {
    const en = normalizeTurnSlice((raw as DilemmaTurnBilingual).en);
    const zh = normalizeTurnSlice((raw as DilemmaTurnBilingual).zh);
    if (en && zh) return { en, zh };
    return null;
  }
  const parsed = parseJsonPayload<Record<string, unknown>>(
    typeof raw === "string" ? raw : JSON.stringify(raw)
  );
  if (!parsed) return null;
  const en = normalizeTurnSlice(pickLocaleBlock(parsed, "en", "english"));
  const zh = normalizeTurnSlice(pickLocaleBlock(parsed, "zh", "chinese", "cn"));
  if (en && zh) return { en, zh };
  const single = normalizeTurnSlice(parsed);
  if (single) return { en: single, zh: single };
  return null;
}

export function parseDilemmaSummaryBilingual(
  raw: DilemmaSummaryBilingual | Record<string, unknown> | string | null | undefined
): DilemmaSummaryBilingual | null {
  if (!raw) return null;
  if (typeof raw === "object" && "en" in raw && "zh" in raw) {
    const en = (raw as DilemmaSummaryBilingual).en?.fullExplanation?.trim();
    const zh = (raw as DilemmaSummaryBilingual).zh?.fullExplanation?.trim();
    if (en && zh) return { en: { fullExplanation: en }, zh: { fullExplanation: zh } };
    return null;
  }
  const parsed = parseJsonPayload<Record<string, unknown>>(
    typeof raw === "string" ? raw : JSON.stringify(raw)
  );
  if (!parsed) return null;
  const enBlock = pickLocaleBlock(parsed, "en", "english") as Record<string, unknown> | undefined;
  const zhBlock = pickLocaleBlock(parsed, "zh", "chinese", "cn") as Record<string, unknown> | undefined;
  const en = String(enBlock?.fullExplanation ?? "").trim();
  const zh = String(zhBlock?.fullExplanation ?? "").trim();
  if (en && zh) return { en: { fullExplanation: en }, zh: { fullExplanation: zh } };
  const single = String(parsed.fullExplanation ?? "").trim();
  if (single) return { en: { fullExplanation: single }, zh: { fullExplanation: single } };
  return null;
}

export function turnToMessages(
  turn: DilemmaTurnBilingual,
  ts: number
): DilemmaStoredMessage[] {
  return [
    {
      id: `philosopher-${ts}`,
      role: "philosopher",
      locales: {
        en: { content: turn.en.philosopherReply },
        zh: { content: turn.zh.philosopherReply },
      },
    },
    {
      id: `judge-${ts + 1}`,
      role: "judge",
      locales: {
        en: { content: turn.en.judgeQuestion },
        zh: { content: turn.zh.judgeQuestion },
      },
    },
  ];
}

export function dilemmaMessageContent(
  msg: DilemmaStoredMessage,
  locale: ArenaLocale,
  t: (key: string, vars?: Record<string, string | number>) => string,
  choiceLabel?: string
): string {
  if (msg.role === "user") {
    return msg.content ?? "";
  }
  if (msg.i18nKey && choiceLabel != null) {
    return t(msg.i18nKey, { choice: choiceLabel });
  }
  const slice = msg.locales?.[locale];
  if (slice?.content) return slice.content;
  return msg.locales?.zh?.content ?? msg.locales?.en?.content ?? msg.content ?? "";
}

export function summaryForLocale(
  summary: DilemmaSummaryBilingual | null,
  locale: ArenaLocale
): string {
  if (!summary) return "";
  return summary[locale]?.fullExplanation ?? summary.zh?.fullExplanation ?? "";
}

export function formatPhilosopherPeriod(
  period: number,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  if (period < 0) {
    return t("dilemma.period.bce", { year: Math.abs(period) });
  }
  return t("dilemma.period.ce", { year: period });
}
