import { apiBaseUrl, authHeaders } from "./client";

export type AgentStreamEvent =
  | { type: "delta"; text: string; accumulated?: string }
  | { type: "done"; text: string; agent?: string; cached?: boolean; [key: string]: unknown }
  | { type: "error"; message: string };

export type AgentStreamHandlers<T extends { text: string }> = {
  onDelta?: (delta: string, accumulated: string) => void;
  onDone?: (data: T) => void;
  onError?: (message: string) => void;
};

function parseSseChunk(buffer: string): { events: AgentStreamEvent[]; rest: string } {
  const events: AgentStreamEvent[] = [];
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  for (const block of parts) {
    for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const json = trimmed.slice(5).trim();
      if (!json || json === "[DONE]") continue;
      try {
        events.push(JSON.parse(json) as AgentStreamEvent);
      } catch {
        /* ignore malformed chunk */
      }
    }
  }
  return { events, rest };
}

/**
 * POST + SSE（后端转发 DashScope 流式 completion）。
 */
export async function apiPostStream<T extends { text: string }>(
  path: string,
  bodyPayload: unknown,
  handlers: AgentStreamHandlers<T> = {}
): Promise<T> {
  const base = apiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = base ? `${base}${p}` : `/api${p}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...authHeaders(),
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const raw = await res.text();
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(raw) as { message?: string };
      if (j.message) msg = j.message;
    } catch {
      if (raw.length < 800) msg = raw;
    }
    handlers.onError?.(msg);
    throw new Error(msg);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("浏览器不支持流式响应");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let donePayload: T | null = null;
  let lastAccumulated = "";

  const consumeEvents = (events: AgentStreamEvent[]) => {
    for (const ev of events) {
      if (ev.type === "delta") {
        lastAccumulated = ev.accumulated ?? lastAccumulated + ev.text;
        handlers.onDelta?.(ev.text, lastAccumulated);
      } else if (ev.type === "error") {
        handlers.onError?.(ev.message);
        throw new Error(ev.message);
      } else if (ev.type === "done") {
        const done = ev as T;
        if (!(done as { text?: string }).text?.trim() && lastAccumulated) {
          (done as { text: string }).text = lastAccumulated;
        }
        donePayload = done;
        handlers.onDone?.(done);
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseChunk(buffer);
      buffer = parsed.rest;
      consumeEvents(parsed.events);
    }
    if (done) {
      buffer += decoder.decode();
      if (buffer.trim()) {
        const parsed = parseSseChunk(buffer + "\n\n");
        consumeEvents(parsed.events);
      }
      break;
    }
  }

  if (!donePayload) {
    throw new Error("流式响应未收到完成事件");
  }
  return donePayload;
}
