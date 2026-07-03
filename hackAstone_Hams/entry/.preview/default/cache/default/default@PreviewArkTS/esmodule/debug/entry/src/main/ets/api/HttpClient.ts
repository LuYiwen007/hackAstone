import http from "@ohos:net.http";
import util from "@ohos:util";
import type { BusinessError } from "@ohos:base";
import { ArenaConfiguration } from "@bundle:com.hackastone.arena/entry/ets/common/ArenaConfiguration";
import { AuthStore } from "@bundle:com.hackastone.arena/entry/ets/store/AuthStore";
import { ApiError } from "@bundle:com.hackastone.arena/entry/ets/api/ApiError";
export interface ApiEnvelope<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}
export interface HttpRequestOptions {
    connectTimeoutMs?: number;
    readTimeoutMs?: number;
    expectJson?: boolean;
}
export class HttpRequestOptionsData implements HttpRequestOptions {
    connectTimeoutMs?: number;
    readTimeoutMs?: number;
    expectJson?: boolean;
}
const DEFAULT_CONNECT_MS = 15000;
const DEFAULT_READ_MS = 20000;
const AGENT_CONNECT_MS = 120000;
const AGENT_READ_MS = 150000;
function defaultRequestOptions(): HttpRequestOptions {
    return new HttpRequestOptionsData();
}
function jsonContentTypeHeader(): Record<string, string> {
    const h: Record<string, string> = {};
    h['Content-Type'] = 'application/json';
    return h;
}
function agentJsonHeaders(): Record<string, string> {
    const h: Record<string, string> = {};
    h['Content-Type'] = 'application/json';
    h['Accept'] = 'application/json';
    return h;
}
function multipartHeader(boundary: string): Record<string, string> {
    const h: Record<string, string> = {};
    h['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
    return h;
}
function agentTimeoutOptions(): HttpRequestOptions {
    const opts = new HttpRequestOptionsData();
    opts.connectTimeoutMs = AGENT_CONNECT_MS;
    opts.readTimeoutMs = AGENT_READ_MS;
    return opts;
}
function uploadTimeoutOptions(): HttpRequestOptions {
    const opts = new HttpRequestOptionsData();
    opts.connectTimeoutMs = DEFAULT_CONNECT_MS;
    opts.readTimeoutMs = DEFAULT_READ_MS;
    return opts;
}
function trimPath(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
}
export function buildApiUrl(path: string): string {
    const base = ArenaConfiguration.apiBaseURLString;
    return `${base}${trimPath(path)}`;
}
export function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const token = AuthStore.bearerToken;
    if (token !== null && token.length > 0) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
function responseBodyToString(result: Object): string {
    if (typeof result === 'string') {
        return result;
    }
    return JSON.stringify(result);
}
export function parseEnvelope(raw: string): Object {
    let obj: Record<string, Object>;
    try {
        obj = JSON.parse(raw) as Record<string, Object>;
    }
    catch (_e) {
        throw ApiError.decode();
    }
    if (obj['success'] !== true) {
        const msg = String(obj['message'] ?? '请求失败');
        const codeRaw = obj['code'];
        const code = typeof codeRaw === 'number' ? codeRaw : Number(codeRaw ?? 0);
        throw ApiError.serverBiz(code, msg);
    }
    if (obj['data'] === undefined) {
        throw ApiError.decode();
    }
    return obj['data'];
}
function mergeHeaders(extra?: Record<string, string>): Record<string, string> {
    const merged: Record<string, string> = {};
    const auth = authHeaders();
    const authKeys = Object.keys(auth);
    for (let i = 0; i < authKeys.length; i++) {
        const k = authKeys[i];
        merged[k] = auth[k];
    }
    if (extra !== undefined) {
        const extraKeys = Object.keys(extra);
        for (let i = 0; i < extraKeys.length; i++) {
            const k = extraKeys[i];
            merged[k] = extra[k];
        }
    }
    return merged;
}
async function executeRequest(url: string, method: http.RequestMethod, options: HttpRequestOptions, header: Record<string, string>, body?: string | ArrayBuffer): Promise<string> {
    const httpRequest = http.createHttp();
    try {
        const response = await httpRequest.request(url, {
            method,
            header,
            extraData: body,
            expectDataType: http.HttpDataType.STRING,
            connectTimeout: options.connectTimeoutMs ?? DEFAULT_CONNECT_MS,
            readTimeout: options.readTimeoutMs ?? DEFAULT_READ_MS,
        });
        const code = response.responseCode;
        if (code < 200 || code >= 300) {
            throw ApiError.httpStatus(code);
        }
        return responseBodyToString(response.result as Object);
    }
    catch (e) {
        if (e instanceof ApiError) {
            throw e;
        }
        const err = e as BusinessError | Error;
        throw ApiError.network(err instanceof Error ? err : new Error(String(err)));
    }
    finally {
        httpRequest.destroy();
    }
}
/** 通用 REST 请求（15s 短超时，注册/登录/catalog 等）。 */
export async function httpRequest(path: string, method: http.RequestMethod, jsonBody?: Record<string, Object>, options?: HttpRequestOptions): Promise<string> {
    const url = buildApiUrl(path);
    const header = mergeHeaders(jsonBody !== undefined ? jsonContentTypeHeader() : undefined);
    const body = jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined;
    const reqOpts = options !== undefined ? options : defaultRequestOptions();
    return executeRequest(url, method, reqOpts, header, body);
}
/** 大模型等非流式 Agent REST（较长超时）。 */
export async function httpAgentRequest(path: string, jsonBody: Record<string, Object>): Promise<string> {
    const url = buildApiUrl(path);
    const header = mergeHeaders(agentJsonHeaders());
    return executeRequest(url, http.RequestMethod.POST, agentTimeoutOptions(), header, JSON.stringify(jsonBody));
}
/** multipart/form-data 上传头像。 */
export async function httpUploadAvatar(jpegData: ArrayBuffer): Promise<string> {
    const url = buildApiUrl('/user/avatar');
    const boundary = `Boundary-${Date.now()}`;
    const prefix = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="avatar.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
    const suffix = `\r\n--${boundary}--\r\n`;
    const encoder = new util.TextEncoder();
    const prefixBytes = encoder.encode(prefix);
    const suffixBytes = encoder.encode(suffix);
    const bodyBytes = new Uint8Array(prefixBytes.length + jpegData.byteLength + suffixBytes.length);
    bodyBytes.set(prefixBytes, 0);
    bodyBytes.set(new Uint8Array(jpegData), prefixBytes.length);
    bodyBytes.set(suffixBytes, prefixBytes.length + jpegData.byteLength);
    const header = mergeHeaders(multipartHeader(boundary));
    return executeRequest(url, http.RequestMethod.POST, uploadTimeoutOptions(), header, bodyBytes.buffer);
}
export class HttpTimeouts {
    static readonly defaultConnectMs: number = DEFAULT_CONNECT_MS;
    static readonly defaultReadMs: number = DEFAULT_READ_MS;
    static readonly agentConnectMs: number = AGENT_CONNECT_MS;
    static readonly agentReadMs: number = AGENT_READ_MS;
    static readonly streamConnectMs: number = 120000;
    static readonly streamReadMs: number = 180000;
}
