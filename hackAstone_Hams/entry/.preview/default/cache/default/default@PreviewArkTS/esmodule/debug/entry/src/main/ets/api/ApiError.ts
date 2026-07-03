import { ApiErrorExtras } from "@bundle:com.hackastone.arena/entry/ets/common/ArkTypes";
export enum ApiErrorKind {
    BAD_URL = "badURL",
    HTTP_STATUS = "httpStatus",
    SERVER_MESSAGE = "serverMessage",
    SERVER_BIZ = "serverBiz",
    DECODE = "decode",
    NETWORK = "network"
}
/** 与 iOS `ArenaAPIError` 对齐的业务/API 错误。 */
export class ApiError extends Error {
    readonly kind: ApiErrorKind;
    readonly httpStatus?: number;
    readonly bizCode?: number;
    readonly serverText?: string;
    readonly causeError?: Error;
    constructor(kind: ApiErrorKind, message: string, extras?: ApiErrorExtras) {
        super(message);
        this.kind = kind;
        if (extras !== undefined) {
            this.httpStatus = extras.httpStatus;
            this.bizCode = extras.bizCode;
            this.serverText = extras.serverText;
            this.causeError = extras.cause;
        }
    }
    static badURL(): ApiError {
        return new ApiError(ApiErrorKind.BAD_URL, '无效的接口地址');
    }
    static httpStatus(code: number): ApiError {
        const extras = new ApiErrorExtras();
        extras.httpStatus = code;
        if (code === 504) {
            return new ApiError(ApiErrorKind.HTTP_STATUS, '服务器生成超时（HTTP 504），请稍后重试', extras);
        }
        return new ApiError(ApiErrorKind.HTTP_STATUS, `HTTP ${code}`, extras);
    }
    static serverMessage(message: string): ApiError {
        const extras = new ApiErrorExtras();
        extras.serverText = message;
        return new ApiError(ApiErrorKind.SERVER_MESSAGE, message, extras);
    }
    static serverBiz(code: number, message: string): ApiError {
        const extras = new ApiErrorExtras();
        extras.bizCode = code;
        extras.serverText = message;
        return new ApiError(ApiErrorKind.SERVER_BIZ, message, extras);
    }
    static decode(): ApiError {
        return new ApiError(ApiErrorKind.DECODE, '数据解析失败');
    }
    static network(err: Error): ApiError {
        const extras = new ApiErrorExtras();
        extras.cause = err;
        const localized = ApiError.localizeNetworkError(err);
        return new ApiError(ApiErrorKind.NETWORK, localized, extras);
    }
    getLocalizedMessage(): string {
        return this.message;
    }
    private static localizeNetworkError(err: Error): string {
        const msg = err.message ?? '';
        const lower = msg.toLowerCase();
        if (lower.includes('timeout') || lower.includes('timed out')) {
            return '连接服务器超时，请检查网络或确认后端已启动（本地调试可用 http://127.0.0.1:8080/api）';
        }
        if (lower.includes('not connected') || lower.includes('network connection lost') ||
            lower.includes('network unavailable')) {
            return '网络不可用，请检查网络连接';
        }
        if (lower.includes('cannot connect') || lower.includes('connection refused') ||
            lower.includes('failed to connect') || lower.includes('cannot find host')) {
            return '无法连接服务器，请确认 API 地址是否正确';
        }
        if (lower.includes('parse') || lower.includes('invalid response')) {
            return '服务器响应格式异常，请稍后重试';
        }
        return msg.length > 0 ? msg : '网络请求失败';
    }
}
export { ApiError as ArenaAPIError };
