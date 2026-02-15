package org.hackastone.base.util.template;

import lombok.extern.slf4j.Slf4j;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.constants.ResultEnum;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.springframework.stereotype.Component;

/**
 * 业务模板类
 * 作用：统一处理 try-catch，统一封装返回值。
 */
@Slf4j // 自动生成日志对象 log
@Component // 告诉 Spring：这个类归你管，启动时把它实例化
public class BizTemplate {

    /**
     * 核心执行方法
     * @param callback 具体的业务逻辑（大厨的做菜步骤）
     * @param <T> 返回值类型
     * @return 统一封装好的 Result
     */
    public <T> Result<T> execute(BizCallback<T> callback) {
        try {
            // 1. 这里的 callback.execute() 就是在调用大厨的代码
            T data = callback.execute();
            
            // 2. 如果没报错，就封装成“成功”信封
            return Result.success(data);
            
        } catch (HackAstoneBizException e) {
            // 3. 捕获“预料到的错误”（比如密码错误）
            log.warn("业务异常捕获: code={}, msg={}", e.getCode(), e.getMessage());
            // 返回对应的错误码给前端
            return Result.fail(e.getCode(), e.getMessage());
            
        } catch (Exception e) {
            // 4. 捕获“未知的系统错误”（比如数据库连不上了，代码写得有bug）
            log.error("系统未知异常", e); // 记录详细报错日志给程序员看
            // 给前端返回“系统内部错误”，不要把报错细节暴露给用户
            return Result.fail(ResultEnum.SYSTEM_ERROR);
        }
    }
}