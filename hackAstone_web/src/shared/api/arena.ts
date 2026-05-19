import type { Battle } from "../../app/data/battles";
import type { Philosopher } from "../../app/data/philosophers";
import type { DebateTopicContent } from "../../app/data/debateTopicTypes";
import type { ArenaLocale } from "../i18n/format";
import { apiGet, apiBaseUrl } from "./client";

export type RegionMeta = { id: string; name: string; x: number; y: number };
export type TimePeriodMeta = {
  id: string;
  year: number;
  label: string;
  era: string;
  startYear?: number;
  endYear?: number;
  showAll?: boolean;
};

export type ArenaCatalogPayload = {
  philosophers: Philosopher[];
  regions: RegionMeta[];
  timePeriods: TimePeriodMeta[];
  battles: Battle[];
  debateTopics: Record<string, DebateTopicContent>;
};

export type MindProfilePayload = {
  biases: {
    name: string;
    description: string;
    percentage: number;
    color: string;
    instances: number;
  }[];
  stats: { label: string; value: string }[];
  recentBattles: {
    question: string;
    choice: string;
    judgeComment: string;
    changed: boolean;
  }[];
};

export type ArenaI18nPayload = {
  locale: ArenaLocale;
  strings: Record<string, string>;
};

export function fetchArenaI18n(locale: ArenaLocale) {
  return apiGet<ArenaI18nPayload>(`/arena/i18n?locale=${locale}`);
}

export function fetchArenaCatalog(locale: ArenaLocale = "en") {
  return apiGet<ArenaCatalogPayload>(`/arena/catalog?locale=${locale}`);
}

export function fetchMindProfile() {
  return apiGet<MindProfilePayload>("/arena/profile");
}

type AgentRunResponse = {
  agent: string;
  appId: string;
  text: string;
  cached: boolean;
};

async function readErrorMessage(res: Response): Promise<string> {
  const raw = await res.text();
  const trimmed = raw.replace(/\s+/g, " ").trim();
  try {
    const body = JSON.parse(raw) as {
      message?: string;
      error?: string;
      path?: string;
      status?: number;
    };
    if (body.message) return body.message;
    if (body.error) return body.error;
  } catch {
    /* 非 JSON（如 Spring Whitelabel HTML） */
  }
  if (trimmed.length > 0 && trimmed.length < 2000) {
    return `HTTP ${res.status}：${trimmed.slice(0, 800)}`;
  }
  return `HTTP ${res.status}`;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = apiBaseUrl();
  const url = base ? `${base}${p}` : `/api${p}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  const json = (await res.json()) as {
    success: boolean;
    message: string;
    data: T;
  };
  if (!json.success) {
    throw new Error(json.message || "请求失败");
  }
  return json.data;
}

export function runAgent(
  agent: "atlas" | "nova" | "forge" | "ledger" | "echo" | "sentinel",
  query: string,
  imageList: string[] = []
) {
  return apiPost<AgentRunResponse>("/arena/agent/run", { agent, query, imageList });
}

export function runEchoQuery(query: string) {
  return runAgent("echo", query, []);
}

export function generateTopic(
  philosopherName: string,
  philosopherSchool: string,
  keyIdeas: string[]
) {
  return apiPost<AgentRunResponse>("/arena/agent/topic", {
    philosopherName,
    philosopherSchool,
    keyIdeas: keyIdeas.join("、"),
  });
}

export function generateRoundtableOpenings(
  topic: string,
  participants: Array<{ id: string; nameCN: string; school: string }>
) {
  return apiPost<AgentRunResponse>("/arena/agent/roundtable/openings", { topic, participants });
}

export function generateRoundtableReply(
  topic: string,
  userInput: string,
  participants: Array<{ id: string; nameCN: string; school: string }>
) {
  return apiPost<AgentRunResponse>("/arena/agent/roundtable/reply", { topic, userInput, participants });
}

/** 道德困境单轮：后端组装 prompt 后调用百炼 Echo */
export function generateDilemmaTurn(body: {
  moralDilemmaTitle: string;
  moralDilemmaEnglishTitle: string;
  question: string;
  promptLead: string;
  userStance: string;
  philosopherName: string;
  philosopherSchool: string;
  keyIdeas: string;
  history: string;
}) {
  return apiPost<AgentRunResponse>("/arena/agent/dilemma/turn", body);
}

export function generateDilemmaSummary(body: {
  moralDilemmaTitle: string;
  question: string;
  userStance: string;
  philosopherName: string;
  philosopherSchool: string;
  history: string;
}) {
  return apiPost<AgentRunResponse>("/arena/agent/dilemma/summary", body);
}
