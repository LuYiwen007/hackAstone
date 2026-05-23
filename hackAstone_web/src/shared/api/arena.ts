import type { Battle } from "../../app/data/battles";
import type { DisciplineBattleBilingual } from "../../app/data/battleLocale";
import type { Philosopher } from "../../app/data/philosophers";
import type { DebateTopicContent } from "../../app/data/debateTopicTypes";
import type { ArenaLocale } from "../i18n/format";
import { getArenaPreferences } from "../arenaPreferences";
import { apiGet, apiPost, isLoggedIn } from "./client";
import { apiPostStream, type AgentStreamHandlers } from "./stream";

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

export type RoundtableMessagesBilingual = {
  en: Array<{ speaker: string; content: string }>;
  zh: Array<{ speaker: string; content: string }>;
};

export type DilemmaTurnBilingual = {
  en: { philosopherReply: string; judgeQuestion: string; continueDebate: boolean };
  zh: { philosopherReply: string; judgeQuestion: string; continueDebate: boolean };
};

export type DilemmaSummaryBilingual = {
  en: { fullExplanation: string };
  zh: { fullExplanation: string };
};

export type DisciplineSummaryBilingual = {
  en: { summary: string };
  zh: { summary: string };
};

export type DisciplineDebateStreamBody = {
  question: string;
  builderView: string;
  breakerView: string;
  userChoice: "builder" | "breaker" | "uncertain";
  userMessage: string;
  history: string;
  locale: string;
};

export type DebateTopicPayload = {
  question: string;
  philosopherView: string;
  oppositeView: string;
  judgeQuestions: string[];
  fullExplanation: string;
};

export type AgentRunResponse = {
  agent: string;
  appId?: string;
  text: string;
  cached?: boolean;
  debateTopic?: DebateTopicPayload;
  battle?: DisciplineBattleBilingual;
  roundtableMessages?: RoundtableMessagesBilingual;
  dilemmaTurn?: DilemmaTurnBilingual;
  dilemmaSummary?: DilemmaSummaryBilingual;
  disciplineDual?: { builder: string; breaker: string };
  disciplineSummary?: DisciplineSummaryBilingual;
  philosophyJudge?: {
    judgeSpeaks: boolean;
    judgeMessage: string;
    addressTo?: string;
    continueDebate: boolean;
  };
};

export function runAgent(
  agent: "atlas" | "nova" | "forge" | "ledger" | "echo" | "sentinel",
  query: string,
  imageList: string[] = [],
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>("/arena/agent/run/stream", { agent, query, imageList }, handlers);
}

export function runEchoQuery(
  query: string,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return runAgent("echo", query, [], handlers);
}

/** 学科辩论 AI 出题：流式返回，结束时含 battle 双语 JSON */
export function generateDisciplineBattle(
  categoryEn: string,
  categoryZh: string,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/discipline/battle/stream",
    { categoryEn, categoryZh },
    handlers
  );
}

export function streamDisciplineDebateOpponent(
  body: DisciplineDebateStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/discipline/debate/opponent/stream",
    body,
    handlers
  );
}

export function streamDisciplineDebateDual(
  body: DisciplineDebateStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/discipline/debate/dual/stream",
    body,
    handlers
  );
}

export function streamDisciplineDebateSummary(
  body: Omit<DisciplineDebateStreamBody, "userMessage" | "locale">,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/discipline/debate/summary/stream",
    body,
    handlers
  );
}

/** 辩题生成（非流式，用于进入辩论前的准备页） */
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

/** 辩题流式（可选，一般不用） */
export function generateTopicStream(
  philosopherName: string,
  philosopherSchool: string,
  keyIdeas: string[],
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/topic/stream",
    {
      philosopherName,
      philosopherSchool,
      keyIdeas: keyIdeas.join("。"),
    },
    handlers
  );
}

/** 圆桌开场（非流式，更稳定，避免内容安全误拦） */
export function generateRoundtableOpenings(
  topic: string,
  participants: Array<{ id: string; nameCN: string; school: string }>
) {
  return apiPost<AgentRunResponse>("/arena/agent/roundtable/openings", {
    topic,
    participants,
  });
}

export function generateRoundtableOpeningsStream(
  topic: string,
  participants: Array<{ id: string; nameCN: string; school: string }>,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/roundtable/openings/stream",
    { topic, participants },
    handlers
  );
}

/** 圆桌回应（非流式） */
export function generateRoundtableReply(
  topic: string,
  userInput: string,
  participants: Array<{ id: string; nameCN: string; school: string }>
) {
  return apiPost<AgentRunResponse>("/arena/agent/roundtable/reply", {
    topic,
    userInput,
    participants,
  });
}

export type RoundtablePhilosopherStreamBody = {
  topic: string;
  philosopherId: string;
  philosopherName: string;
  school: string;
  keyIdeas?: string;
  summary?: string;
  history: string;
  locale: string;
  userInput?: string;
};

export type PhilosophyPhilosopherStreamBody = {
  debateQuestion: string;
  philosopherId: string;
  philosopherName: string;
  school: string;
  keyIdeas?: string;
  summary?: string;
  userStance: string;
  history: string;
  locale: string;
};

export function streamPhilosophyPhilosopherToUser(
  body: PhilosophyPhilosopherStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/philosophy/philosopher/to-user/stream",
    body,
    handlers
  );
}

export function streamPhilosophyPhilosopherToJudge(
  body: PhilosophyPhilosopherStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/philosophy/philosopher/to-judge/stream",
    body,
    handlers
  );
}

export type PhilosophyJudgeStreamBody = {
  debateQuestion: string;
  philosopherName: string;
  school: string;
  userStance: string;
  history: string;
  locale: string;
};

export function streamPhilosophyJudgeStep(
  body: PhilosophyJudgeStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/philosophy/judge/step/stream",
    body,
    handlers
  );
}

export function streamRoundtablePhilosopherOpening(
  body: RoundtablePhilosopherStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/roundtable/philosopher/opening/stream",
    body,
    handlers
  );
}

export function streamRoundtablePhilosopherReply(
  body: RoundtablePhilosopherStreamBody & { userInput: string },
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/roundtable/philosopher/reply/stream",
    body,
    handlers
  );
}

export function generateRoundtableReplyStream(
  topic: string,
  userInput: string,
  participants: Array<{ id: string; nameCN: string; school: string }>,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/roundtable/reply/stream",
    { topic, userInput, participants },
    handlers
  );
}

export type DilemmaDebateStreamBody = {
  moralDilemmaTitle: string;
  moralDilemmaEnglishTitle: string;
  question: string;
  promptLead: string;
  userStance: string;
  philosopherId: string;
  philosopherName: string;
  philosopherSchool: string;
  keyIdeas?: string;
  summary?: string;
  history: string;
  locale: string;
};

export function streamDilemmaPhilosopherToUser(
  body: DilemmaDebateStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/dilemma/philosopher/to-user/stream",
    body,
    handlers
  );
}

export function streamDilemmaJudgeStep(
  body: Omit<DilemmaDebateStreamBody, "philosopherId" | "keyIdeas" | "summary">,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>("/arena/agent/dilemma/judge/step/stream", body, handlers);
}

export function streamDilemmaPhilosopherToJudge(
  body: DilemmaDebateStreamBody,
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>(
    "/arena/agent/dilemma/philosopher/to-judge/stream",
    body,
    handlers
  );
}

/** @deprecated 合并双语 JSON 单轮；请用分步流式接口 */
export function generateDilemmaTurn(
  body: {
    moralDilemmaTitle: string;
    moralDilemmaEnglishTitle: string;
    question: string;
    promptLead: string;
    userStance: string;
    philosopherName: string;
    philosopherSchool: string;
    keyIdeas: string;
    history: string;
  },
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>("/arena/agent/dilemma/turn/stream", body, handlers);
}

export function generateDilemmaSummary(
  body: {
    moralDilemmaTitle: string;
    question: string;
    userStance: string;
    philosopherName: string;
    philosopherSchool: string;
    history: string;
  },
  handlers: AgentStreamHandlers<AgentRunResponse> = {}
) {
  return apiPostStream<AgentRunResponse>("/arena/agent/dilemma/summary/stream", body, handlers);
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

/** 尊重用户「自动保存辩论记录」设置 */
export function maybeSaveBattleRecord(
  body: Parameters<typeof saveBattleRecord>[0]
): Promise<string | void> {
  if (!isLoggedIn() || !getArenaPreferences().autoSave) {
    return Promise.resolve();
  }
  return saveBattleRecord(body);
}

export function buildDebateNoteKey(philosopherId: string, question: string) {
  return `${philosopherId}|${question.trim()}`;
}

export type DebateNotePayload = {
  id?: string;
  content?: string;
  topic?: string;
  updatedAt?: string;
};

export function fetchDebateNote(sourceType: string, sourceKey: string) {
  const q = new URLSearchParams({ sourceType, sourceKey });
  return apiGet<DebateNotePayload>(`/arena/notes?${q.toString()}`);
}

export function saveDebateNote(body: {
  sourceType: string;
  sourceKey: string;
  topic: string;
  content: string;
}) {
  return apiPost<{ id: string; content: string }>("/arena/notes", body);
}
