/** SSE 流式事件（ArkTS 不允许 union object literal 类型）。 */
export class AgentStreamEvent {
  type: string = '';
  text: string = '';
  accumulated: string = '';
  message: string = '';
  agent: string = '';
  cached: boolean = false;

  static fromJson(obj: Record<string, Object>): AgentStreamEvent {
    const ev = new AgentStreamEvent();
    ev.type = String(obj['type'] ?? '');
    ev.text = String(obj['text'] ?? '');
    ev.accumulated = String(obj['accumulated'] ?? '');
    ev.message = String(obj['message'] ?? '');
    ev.agent = String(obj['agent'] ?? '');
    ev.cached = obj['cached'] === true;
    return ev;
  }
}

export class SseParseResult {
  events: AgentStreamEvent[] = [];
  rest: string = '';

  constructor(events: AgentStreamEvent[], rest: string) {
    this.events = events;
    this.rest = rest;
  }
}

export class StreamDoneHolder {
  payload: Record<string, Object> | null = null;
}

export class StringHolder {
  value: string = '';

  constructor(v: string = '') {
    this.value = v;
  }
}

export class PresetTopicResult {
  title: string = '';
  description: string = '';

  constructor(title: string, description: string) {
    this.title = title;
    this.description = description;
  }
}

export class ApiErrorExtras {
  httpStatus?: number;
  bizCode?: number;
  serverText?: string;
  cause?: Error;
}
