import type { Battle } from "../../app/data/battles";
import type { DisciplineBattleBilingual } from "../../app/data/battleLocale";
import type { Philosopher } from "../../app/data/philosophers";
import type { DebateTopicContent } from "../../app/data/debateTopicTypes";
import type { ArenaLocale } from "../i18n/format";
import { apiGet, apiPost } from "./client";

export type { DisciplineBattleBilingual };

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
  battle?: DisciplineBattleBilingual;
};

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

/** 学科辩论 AI 出题：一次返回中英文两套对局文案 */
export function generateDisciplineBattle(categoryEn: string, categoryZh: string) {
  return apiPost<AgentRunResponse>("/arena/agent/discipline/battle", {
    categoryEn,
    categoryZh,
  });
}

export function generateTopic(
  philosopherName: string,
  philosopherSchool: string,
  keyIdeas: string[]
) {
  return apiPost<AgentRunResponse>("/arena/agent/topic", {
    philosopherName,
    philosopherSchool,
    keyIdeas: keyIdeas.join("。"),
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

export function saveBattleRecord(body: {
  battleType: string;
  topic: string;
  userChoice: string;
  judgeSummary: string;
  changedStance: boolean;
  messages?: unknown;
}) {
  return apiPost<string>("/arena/battle/record", body);
}
