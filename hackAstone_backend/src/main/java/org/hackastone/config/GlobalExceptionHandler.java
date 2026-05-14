package org.hackastone.config;

import lombok.extern.slf4j.Slf4j;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.constants.ResultEnum;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 将业务异常转为统一 {@link Result} 响应（HTTP 200），避免前端只看到 HTTP 500。
 * 与 {@link org.hackastone.base.util.template.BizTemplate} 行为一致。
 */
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HackAstoneBizException.class)
    public ResponseEntity<Result<?>> handleBiz(HackAstoneBizException e) {
        log.warn("业务异常: code={}, msg={}", e.getCode(), e.getMessage());
        return ResponseEntity.ok(Result.fail(e.getCode(), e.getMessage()));
    }

    /** 未预期异常也返回统一 JSON（HTTP 200），便于前端展示 message，而非仅 “HTTP 500”。 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<?>> handleUnexpected(Exception e) {
        log.error("未处理异常", e);
        String msg = e.getMessage();
        if (msg == null || msg.isEmpty()) {
            msg = ResultEnum.SYSTEM_ERROR.getMessage();
        }
        return ResponseEntity.ok(Result.fail(ResultEnum.SYSTEM_ERROR.getCode(), msg));
    }
}
