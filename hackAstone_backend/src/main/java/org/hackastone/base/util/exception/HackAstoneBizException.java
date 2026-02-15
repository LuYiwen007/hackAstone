package org.hackastone.base.util.exception;

import lombok.Getter;
import org.hackastone.base.util.constants.ResultEnum;

/**
 * 自定义业务异常
 * 当我们的代码发现逻辑不对（比如密码错误）时，就抛出这个异常。
 * 它比普通的 Exception 多带了一个“错误码”。
 */
@Getter
public class HackAstoneBizException extends RuntimeException {
    
    private final int code;

    // 用枚举构造（推荐）
    // 用法：throw new HackAstoneBizException(ResultEnum.PASSWORD_ERROR);
    public HackAstoneBizException(ResultEnum resultEnum) {
        super(resultEnum.getMessage());
        this.code = resultEnum.getCode();
    }
    
    // 手动指定错误码和消息
    public HackAstoneBizException(int code, String message) {
        super(message);
        this.code = code;
    }
    
    // 只指定消息，默认用系统错误码
    public HackAstoneBizException(String message) {
        super(message);
        this.code = ResultEnum.SYSTEM_ERROR.getCode();
    }
}