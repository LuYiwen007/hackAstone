package org.hackastone.biz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 解析圆桌辩论 Echo 返回的双语 JSON（en/zh 各含 messages 数组）。
 */
public final class RoundtableMessagesParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private RoundtableMessagesParser() {
    }

    public static Map<String, Object> parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        JsonNode root = parseRoot(raw.trim());
        if (root == null || !root.isObject()) {
            return null;
        }
        JsonNode enNode = pickLocaleNode(root, "en", "english");
        JsonNode zhNode = pickLocaleNode(root, "zh", "chinese", "cn");
        if (enNode == null && zhNode == null && root.has("messages")) {
            enNode = root;
            zhNode = root;
        }
        List<Map<String, Object>> en = readMessages(enNode);
        List<Map<String, Object>> zh = readMessages(zhNode);
        if (en == null || zh == null || en.isEmpty() || zh.isEmpty()) {
            return null;
        }
        if (en.size() != zh.size()) {
            int n = Math.min(en.size(), zh.size());
            en = en.subList(0, n);
            zh = zh.subList(0, n);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("en", en);
        out.put("zh", zh);
        return out;
    }

    private static JsonNode parseRoot(String raw) {
        try {
            return MAPPER.readTree(raw);
        } catch (Exception ignored) {
            /* fall through */
        }
        String fenced = extractFencedJson(raw);
        if (fenced != null) {
            try {
                return MAPPER.readTree(fenced);
            } catch (Exception ignored) {
                return null;
            }
        }
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return MAPPER.readTree(raw.substring(start, end + 1));
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private static String extractFencedJson(String raw) {
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("```(?:json)?\\s*([\\s\\S]*?)\\s*```", java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(raw);
        if (m.find()) {
            return m.group(1).trim();
        }
        return null;
    }

    private static JsonNode pickLocaleNode(JsonNode root, String... keys) {
        for (String key : keys) {
            if (root.has(key) && root.get(key).isObject()) {
                return root.get(key);
            }
        }
        Iterator<String> names = root.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            for (String key : keys) {
                if (name.equalsIgnoreCase(key) && root.get(name).isObject()) {
                    return root.get(name);
                }
            }
        }
        return null;
    }

    private static List<Map<String, Object>> readMessages(JsonNode localeNode) {
        if (localeNode == null || !localeNode.isObject()) {
            return null;
        }
        JsonNode arr = localeNode.get("messages");
        if (arr == null || !arr.isArray()) {
            return null;
        }
        List<Map<String, Object>> out = new ArrayList<>();
        for (JsonNode item : arr) {
            if (!item.isObject()) {
                continue;
            }
            String speaker = text(item, "speaker");
            String content = text(item, "content");
            if (isBlank(speaker) || isBlank(content)) {
                continue;
            }
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("speaker", speaker.trim());
            msg.put("content", content.trim());
            out.add(msg);
        }
        return out.isEmpty() ? null : out;
    }

    private static String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) {
            return null;
        }
        return v.asText();
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
