import type { ArenaLocale } from "../../shared/i18n/format";
import { parseJsonPayload } from "../../shared/jsonPayload";

export type RoundtableMessageSlice = {
  speaker: string;
  content: string;
};

export type RoundtableMessagesBilingual = {
  en: RoundtableMessageSlice[];
  zh: RoundtableMessageSlice[];
};

export type RoundtableMessageLocales = {
  en?: { content: string };
  zh?: { content: string };
};

/** 圆桌消息：AI 回复含双语 locales；用户消息仅用 content */
export type RoundtableStoredMessage = {
  id: string;
  speaker: string;
  locales?: RoundtableMessageLocales;
  content?: string;
  timestamp: number;
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

function normalizeMessageList(arr: unknown): RoundtableMessageSlice[] | null {
  if (!Array.isArray(arr)) return null;
  const out: RoundtableMessageSlice[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const speaker = String(o.speaker ?? "").trim();
    const content = String(o.content ?? "").trim();
    if (speaker && content) out.push({ speaker, content });
  }
  return out.length ? out : null;
}

function readMessages(raw: unknown): RoundtableMessageSlice[] | null {
  if (Array.isArray(raw)) return normalizeMessageList(raw);
  if (!raw || typeof raw !== "object") return null;
  return normalizeMessageList((raw as Record<string, unknown>).messages);
}

/** 解析后端 roundtableMessages 或模型原始 text */
export function parseRoundtableMessagesBilingual(
  raw:
    | RoundtableMessagesBilingual
    | Record<string, unknown>
    | string
    | null
    | undefined
): RoundtableMessagesBilingual | null {
  if (!raw) return null;
  if (typeof raw === "object" && "en" in raw && "zh" in raw) {
    const root = raw as RoundtableMessagesBilingual;
    const en = readMessages(root.en);
    const zh = readMessages(root.zh);
    if (en && zh) return { en, zh };
    return null;
  }
  const parsed = parseJsonPayload<Record<string, unknown>>(
    typeof raw === "string" ? raw : JSON.stringify(raw)
  );
  if (!parsed) return null;
  const en = readMessages(pickLocaleBlock(parsed, "en", "english"));
  const zh = readMessages(pickLocaleBlock(parsed, "zh", "chinese", "cn"));
  if (en && zh) return { en, zh };
  const single = readMessages(parsed);
  if (single) return { en: single, zh: single };
  return null;
}

export function mergeBilingualToStoredMessages(
  bilingual: RoundtableMessagesBilingual,
  idPrefix: string,
  baseTimestamp: number
): RoundtableStoredMessage[] {
  const n = Math.min(bilingual.en.length, bilingual.zh.length);
  return Array.from({ length: n }, (_, index) => {
    const en = bilingual.en[index];
    const zh = bilingual.zh[index];
    const speaker = en.speaker || zh.speaker;
    return {
      id: `${idPrefix}-${speaker}-${baseTimestamp}-${index}`,
      speaker,
      locales: {
        en: { content: en.content },
        zh: { content: zh.content },
      },
      timestamp: baseTimestamp + index * 300,
    };
  });
}

/** 流式累积文本 → 气泡展示（兼容纯文本或 {"content":"..."} JSON） */
export function roundtableStreamDisplayText(accumulated: string): string {
  if (!accumulated) return "";
  const parsed = parseJsonPayload<{ content?: string }>(accumulated);
  if (parsed?.content?.trim()) return parsed.content.trim();
  let s = accumulated.trim();
  const metaCut = s.indexOf('}{"output"');
  if (metaCut > 0) s = s.slice(0, metaCut);
  const m = s.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (m?.[1]) {
    return m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (s.startsWith("{")) return s;
  return s;
}

export function finalizeRoundtableSpeech(raw: string): string {
  const display = roundtableStreamDisplayText(raw);
  return display || raw.trim();
}

export function roundtableMessageContent(
  msg: RoundtableStoredMessage,
  locale: ArenaLocale
): string {
  if (msg.speaker === "user") {
    return msg.content ?? msg.locales?.[locale]?.content ?? msg.locales?.zh?.content ?? "";
  }
  const slice = msg.locales?.[locale];
  if (slice?.content) return slice.content;
  return msg.locales?.zh?.content ?? msg.locales?.en?.content ?? msg.content ?? "";
}
