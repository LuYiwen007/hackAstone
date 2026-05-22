package org.hackastone.biz;

/**
 * 百炼 DashScope 应用流式输出回调（incremental_output=true 时 delta 为增量片段）。
 */
@FunctionalInterface
public interface BailianStreamHandler {
    void onDelta(String delta, String accumulatedText);
}
