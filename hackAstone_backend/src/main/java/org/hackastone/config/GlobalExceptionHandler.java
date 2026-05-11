package org.hackastone.config;

import lombok.extern.slf4j.Slf4j;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 将业务异常转为统一 {@link Result} 响应（HTTP 200），避免前端只看到 HTTP 500。
 * 与 {@link org.hackastone.base.util.template.BizTemplate} 行为一致。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HackAstoneBizException.class)
    public Result<?> handleBiz(HackAstoneBizException e) {
        log.warn("业务异常: code={}, msg={}", e.getCode(), e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }
}
