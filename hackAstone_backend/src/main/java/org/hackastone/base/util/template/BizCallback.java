package org.hackastone.base.util.template;

/**
 * 业务逻辑回调接口
 * 这是一个函数式接口，只有一个方法 execute。
 * 以后写业务代码时，就写在 execute() 里面。
 */
@FunctionalInterface
public interface BizCallback<T> {
    
    // 大厨做菜的地方，返回做好的菜（T）
    T execute();
}