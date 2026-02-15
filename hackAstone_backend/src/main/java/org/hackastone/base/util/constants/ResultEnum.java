package org.hackastone.base.util.constants;

import lombok.Getter;

/**
 * 响应状态码枚举
 * 这里的代码对应 README 中约定的错误码
 */
@Getter
public enum ResultEnum {
    // 通用状态码
    SUCCESS(200, "成功"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未登录或登录失效"),
    FORBIDDEN(403, "无权限"),
    NOT_FOUND(404, "资源未找到"),
    SYSTEM_ERROR(500, "系统内部错误"),

    // 业务错误码 (1000起)
    USER_EXIST(1001, "用户已存在"),
    USER_NOT_EXIST(1002, "用户不存在"),
    PASSWORD_ERROR(1003, "密码错误"),
    PLAN_NOT_FOUND(2001, "计划不存在"),
    AI_SERVICE_ERROR(3001, "AI服务暂时不可用");

    private final int code;
    private final String message;

    ResultEnum(int code, String message) {
        this.code = code;
        this.message = message;
    }
}