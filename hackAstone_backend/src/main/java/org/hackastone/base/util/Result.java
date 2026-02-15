package org.hackastone.base.util;

import lombok.Data;
import org.hackastone.base.util.constants.ResultEnum;
import java.io.Serializable;

/**
 * 统一响应结构
 * 前端收到的 JSON 永远是这个样子：
 * {
 * "success": true,
 * "code": 200,
 * "message": "成功",
 * "data": { ...具体数据... }
 * }
 */
@Data
public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    private Boolean success;
    private Integer code;
    private String message;
    private T data;

    // 无参构造
    public Result() {}

    // 快速生成成功响应
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setSuccess(true);
        result.setCode(ResultEnum.SUCCESS.getCode());
        result.setMessage(ResultEnum.SUCCESS.getMessage());
        result.setData(data);
        return result;
    }

    // 快速生成无数据的成功响应
    public static <T> Result<T> success() {
        return success(null);
    }

    // 快速生成失败响应（使用枚举）
    public static <T> Result<T> fail(ResultEnum resultEnum) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setCode(resultEnum.getCode());
        result.setMessage(resultEnum.getMessage());
        return result;
    }

    // 快速生成自定义失败响应（比如代码里捕获了一个异常）
    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setSuccess(false);
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}