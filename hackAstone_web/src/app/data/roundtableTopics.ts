export const ROUNDTABLE_TOPIC_IDS = [
  "ai-free-will",
  "utopia",
  "truth",
  "education",
] as const;

export type RoundtableTopicId = (typeof ROUNDTABLE_TOPIC_IDS)[number];

export function roundtableTopicTitleKey(id: RoundtableTopicId): string {
  return `roundtable.topic.${id}.title`;
}

export function roundtableTopicDescriptionKey(id: RoundtableTopicId): string {
  return `roundtable.topic.${id}.description`;
}
