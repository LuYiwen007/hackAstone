/** 提取第一个完整 JSON 对象（避免流式尾包 {@code {"output":...}} 导致 lastIndexOf 截错） */
function extractFirstJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const c = raw[i];
    if (inString) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return raw.slice(start, i + 1);
    }
  }
  return null;
}

/** 解析 Echo 返回的 JSON（可能含 markdown 围栏、流式尾包或前后缀文案） */
export function parseJsonPayload<T>(raw: string): T | null {
  if (!raw) return null;
  let trimmed = raw.trim();
  const metaCut = trimmed.indexOf('}{"output"');
  if (metaCut > 0) trimmed = trimmed.slice(0, metaCut + 1);
  const direct = tryParse<T>(trimmed);
  if (direct) return direct;
  const fenced =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/i) ||
    trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return tryParse<T>(fenced[1].trim());
  const firstObj = extractFirstJsonObject(trimmed);
  if (firstObj) return tryParse<T>(firstObj);
  return null;
}

function tryParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
