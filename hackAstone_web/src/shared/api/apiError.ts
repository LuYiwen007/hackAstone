/** 与后端 ResultEnum 业务码对齐 */
export const API_ERROR_I18N: Record<number, string> = {
  400: "error.paramError",
  1001: "error.userExist",
  1002: "error.userNotExist",
  1003: "error.passwordError",
};

/** 后端中文 message 兜底映射（旧客户端或未带 code 时） */
const MESSAGE_ZH_TO_KEY: Record<string, string> = {
  用户不存在: "error.userNotExist",
  密码错误: "error.passwordError",
  用户已存在: "error.userExist",
  该邮箱已被注册: "error.emailTaken",
  该昵称已被使用: "error.nicknameTaken",
};

export class ApiClientError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

export function localizeApiError(
  err: unknown,
  t: (key: string) => string
): string {
  if (err instanceof ApiClientError) {
    const key = API_ERROR_I18N[err.code];
    if (key) {
      const localized = t(key);
      if (localized && localized !== key) return localized;
    }
  }
  if (err instanceof Error) {
    const key = MESSAGE_ZH_TO_KEY[err.message.trim()];
    if (key) {
      const localized = t(key);
      if (localized && localized !== key) return localized;
    }
    if (err.message) return err.message;
  }
  const generic = t("error.generic");
  return generic !== "error.generic" ? generic : "Something went wrong";
}
