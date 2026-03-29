import type { Battle } from "../../app/data/battles";
import type { Philosopher } from "../../app/data/philosophers";
import type { DebateTopicContent } from "../../app/data/debateTopicTypes";
import { apiGet } from "./client";

export type RegionMeta = { id: string; name: string; x: number; y: number };
export type TimePeriodMeta = { year: number; label: string; era: string };

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

export function fetchArenaCatalog() {
  return apiGet<ArenaCatalogPayload>("/arena/catalog");
}

export function fetchMindProfile() {
  return apiGet<MindProfilePayload>("/arena/profile");
}
