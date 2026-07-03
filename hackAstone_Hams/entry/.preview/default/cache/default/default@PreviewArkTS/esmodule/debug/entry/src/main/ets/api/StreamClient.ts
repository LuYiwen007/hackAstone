import http from "@ohos:net.http";
import util from "@ohos:util";
import type { BusinessError } from "@ohos:base";
import { ApiError } from "@bundle:com.hackastone.arena/entry/ets/api/ApiError";
import { authHeaders, buildApiUrl, HttpTimeouts } from "@bundle:com.hackastone.arena/entry/ets/api/HttpClient";
import { AgentStreamEvent, SseParseResult, StreamDoneHolder, StringHolder, } from "@bundle:com.hackastone.arena/entry/ets/common/ArkTypes";
export type StreamDeltaHandler = (delta: string, accumulated: string) => void;
export class AgentStreamHandlers {
    onDelta?: StreamDeltaHandler;
    onDone?: (data: Record<string, Object>) => void;
    onError?: (message: string) => void;
}
function parseSseChunk(buffer: string): SseParseResult {
    const events: AgentStreamEvent[] = [];
    const parts = buffer.split('\n\n');
    const rest = parts.length > 0 ? parts[parts.length - 1] : '';
    if (parts.length > 0) {
        parts.pop();
    }
    for (let i = 0; i < parts.length; i++) {
        const block = parts[i];
        const lines = block.split('\n');
        for (let j = 0; j < lines.length; j++) {
            const trimmed = lines[j].trim();
            if (!trimmed.startsWith('data:')) {
                continue;
            }
            const json = trimmed.substring(5).trim();
            if (json.length === 0 || json === '[DONE]') {
                continue;
            }
            try {
                const obj = JSON.parse(json) as Record<string, Object>;
                events.push(AgentStreamEvent.fromJson(obj));
            }
            catch (_e) {
                // ignore malformed chunk
            }
        }
    }
    return new SseParseResult(events, rest);
}
function consumeSseEvents(events: AgentStreamEvent[], onDelta: StreamDeltaHandler | undefined, doneHolder: StreamDoneHolder, lastAccumulatedHolder: StringHolder): void {
    for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        if (ev.type === 'delta') {
            const delta = ev.text;
            const acc = ev.accumulated.length > 0 ? ev.accumulated : (lastAccumulatedHolder.value + delta);
            if (acc.length > 0) {
                lastAccumulatedHolder.value = acc;
            }
            if (delta.length > 0 && onDelta !== undefined) {
                onDelta(delta, lastAccumulatedHolder.value);
            }
        }
        else if (ev.type === 'error') {
            const payload: Record<string, Object> = {};
            payload['type'] = 'error';
            payload['message'] = ev.message.length > 0 ? ev.message : '流式请求失败';
            doneHolder.payload = payload;
        }
        else if (ev.type === 'done') {
            const payload: Record<string, Object> = {};
            payload['type'] = 'done';
            payload['text'] = ev.text.length > 0 ? ev.text : lastAccumulatedHolder.value;
            payload['agent'] = ev.agent.length > 0 ? ev.agent : 'echo';
            payload['cached'] = ev.cached;
            doneHolder.payload = payload;
        }
    }
}
function consumeSseBlocks(bufferHolder: StringHolder, onDelta: StreamDeltaHandler | undefined, doneHolder: StreamDoneHolder, lastAccumulatedHolder: StringHolder): void {
    while (true) {
        const idx = bufferHolder.value.indexOf('\n\n');
        if (idx < 0) {
            break;
        }
        const block = bufferHolder.value.substring(0, idx);
        bufferHolder.value = bufferHolder.value.substring(idx + 2);
        const parsed = parseSseChunk(block + '\n\n');
        consumeSseEvents(parsed.events, onDelta, doneHolder, lastAccumulatedHolder);
        if (doneHolder.payload !== null && doneHolder.payload['type'] === 'error') {
            break;
        }
    }
}
/**
 * POST + SSE（后端转发 DashScope 流式 completion）。
 */
export async function apiPostStream(path: string, bodyPayload: Record<string, Object>, handlers: AgentStreamHandlers = new AgentStreamHandlers()): Promise<Record<string, Object>> {
    const url = buildApiUrl(path);
    const header: Record<string, string> = authHeaders();
    header['Content-Type'] = 'application/json';
    header['Accept'] = 'text/event-stream';
    header['Accept-Encoding'] = 'identity';
    header['Cache-Control'] = 'no-cache';
    header['Connection'] = 'keep-alive';
    return new Promise<Record<string, Object>>((resolve, reject) => {
        const httpRequest = http.createHttp();
        const bufferHolder = new StringHolder('');
        const doneHolder = new StreamDoneHolder();
        const lastAccumulatedHolder = new StringHolder('');
        const decoder = new util.TextDecoder('utf-8', { ignoreBOM: true });
        let finished = false;
        const finishError = (err: ApiError) => {
            if (finished) {
                return;
            }
            finished = true;
            httpRequest.off('dataReceive');
            httpRequest.off('dataEnd');
            httpRequest.destroy();
            reject(err);
        };
        const finishSuccess = (payload: Record<string, Object>) => {
            if (finished) {
                return;
            }
            finished = true;
            httpRequest.off('dataReceive');
            httpRequest.off('dataEnd');
            httpRequest.destroy();
            resolve(payload);
        };
        const flushTail = () => {
            if (bufferHolder.value.trim().length > 0) {
                bufferHolder.value += '\n';
                consumeSseBlocks(bufferHolder, handlers.onDelta, doneHolder, lastAccumulatedHolder);
            }
            if (doneHolder.payload !== null && doneHolder.payload['type'] === 'error') {
                const msg = String(doneHolder.payload['message'] ?? '流式请求失败');
                if (handlers.onError !== undefined) {
                    handlers.onError(msg);
                }
                finishError(ApiError.serverMessage(msg));
                return;
            }
            if (doneHolder.payload === null && lastAccumulatedHolder.value.length > 0) {
                const fallback: Record<string, Object> = {};
                fallback['type'] = 'done';
                fallback['text'] = lastAccumulatedHolder.value;
                fallback['agent'] = 'echo';
                fallback['cached'] = false;
                doneHolder.payload = fallback;
            }
            if (doneHolder.payload === null) {
                finishError(ApiError.serverMessage('流式响应未收到完成事件'));
                return;
            }
            if (handlers.onDone !== undefined) {
                handlers.onDone(doneHolder.payload);
            }
            finishSuccess(doneHolder.payload);
        };
        httpRequest.on('dataReceive', (data: ArrayBuffer) => {
            try {
                const chunk = decoder.decodeWithStream(new Uint8Array(data), { stream: true });
                bufferHolder.value += chunk;
                consumeSseBlocks(bufferHolder, handlers.onDelta, doneHolder, lastAccumulatedHolder);
                if (doneHolder.payload !== null && doneHolder.payload['type'] === 'error') {
                    const msg = String(doneHolder.payload['message'] ?? '流式请求失败');
                    if (handlers.onError !== undefined) {
                        handlers.onError(msg);
                    }
                    finishError(ApiError.serverMessage(msg));
                }
            }
            catch (e) {
                finishError(ApiError.network(e instanceof Error ? e : new Error(String(e))));
            }
        });
        httpRequest.on('dataEnd', () => {
            try {
                const tail = decoder.decodeWithStream(new Uint8Array(0), { stream: false });
                bufferHolder.value += tail;
                flushTail();
            }
            catch (e) {
                finishError(ApiError.network(e instanceof Error ? e : new Error(String(e))));
            }
        });
        const options: http.HttpRequestOptions = {
            method: http.RequestMethod.POST,
            header,
            extraData: JSON.stringify(bodyPayload),
            expectDataType: http.HttpDataType.STRING,
            connectTimeout: HttpTimeouts.streamConnectMs,
            readTimeout: HttpTimeouts.streamReadMs,
            usingCache: false,
        };
        httpRequest.requestInStream(url, options, (err: BusinessError, responseCode: number) => {
            if (err) {
                const netErr = new Error(String(err.message ?? err));
                if (handlers.onError !== undefined) {
                    handlers.onError(netErr.message);
                }
                finishError(ApiError.network(netErr));
                return;
            }
            if (responseCode < 200 || responseCode >= 300) {
                const apiErr = ApiError.httpStatus(responseCode);
                if (handlers.onError !== undefined) {
                    handlers.onError(apiErr.message);
                }
                finishError(apiErr);
            }
        });
    });
}
export { parseSseChunk, consumeSseBlocks };
