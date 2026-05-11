/** 解析 Echo 返回的 JSON（可能含 markdown 围栏或前后缀文案） */
export function parseJsonPayload<T>(raw: string): T | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const direct = tryParse<T>(trimmed);
  if (direct) return direct;
  const fenced =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/i) ||
    trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return tryParse<T>(fenced[1].trim());
  const firstObj = trimmed.indexOf("{");
  const lastObj = trimmed.lastIndexOf("}");
  if (firstObj >= 0 && lastObj > firstObj) {
    return tryParse<T>(trimmed.slice(firstObj, lastObj + 1));
  }
  return null;
}

function tryParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
