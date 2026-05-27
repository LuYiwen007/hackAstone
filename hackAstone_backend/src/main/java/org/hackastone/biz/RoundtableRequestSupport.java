package org.hackastone.biz;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

/** 圆桌 API 请求体解析 */
public final class RoundtableRequestSupport {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private RoundtableRequestSupport() {
    }

    public static String participantsJson(Map<String, Object> request) {
        Object raw = request.get("participants");
        if (raw == null) {
            return "[]";
        }
        try {
            return MAPPER.writeValueAsString(raw);
        } catch (Exception e) {
            return String.valueOf(raw);
        }
    }

    public static boolean isContentFilterMessage(String message) {
        if (message == null) {
            return false;
        }
        String lower = message.toLowerCase();
        return lower.contains("inappropriate content")
                || lower.contains("inappropriate-content")
                || message.contains("内容安全")
                || message.contains("不当内容");
    }
}
