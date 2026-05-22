package org.hackastone.biz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 解析学科辩论对话与总结（纯文本分段 / 双语 JSON）。
 */
public final class DisciplineDebateParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern BUILDER_MARKER = Pattern.compile(
            "(?m)^\\s*(?:\\[Builder\\]|【建构者】|建构者[:：])\\s*");
    private static final Pattern BREAKER_MARKER = Pattern.compile(
            "(?m)^\\s*(?:\\[Breaker\\]|【破坏者】|破坏者[:：])\\s*");

    private DisciplineDebateParser() {
    }

    /** 不确定立场：从模型输出拆出 Builder / Breaker 两段 */
    public static Map<String, String> parseDualReply(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String text = raw.trim();
        Matcher b = BUILDER_MARKER.matcher(text);
        Matcher k = BREAKER_MARKER.matcher(text);
        boolean hasBuilder = b.find();
        boolean hasBreaker = k.find();
        if (!hasBuilder || !hasBreaker) {
            return null;
        }
        int builderStart = b.end();
        int breakerStart = k.start();
        int breakerContentStart = k.end();
        if (builderStart >= breakerStart) {
            return null;
        }
        String builderText = text.substring(builderStart, breakerStart).trim();
        String breakerText = text.substring(breakerContentStart).trim();
        if (builderText.isBlank() || breakerText.isBlank()) {
            return null;
        }
        Map<String, String> out = new LinkedHashMap<>();
        out.put("builder", builderText);
        out.put("breaker", breakerText);
        return out;
    }

    /** 总结：双语 summary 字段（兼容 reveal / fullExplanation） */
    public static Map<String, Object> parseSummary(String raw) {
        JsonNode root = parseRoot(raw);
        if (root == null || !root.isObject()) {
            return null;
        }
        JsonNode enNode = pickLocaleNode(root, "en", "english");
        JsonNode zhNode = pickLocaleNode(root, "zh", "chinese", "cn");
        if (enNode == null && zhNode == null) {
            String single = firstNonEmpty(
                    text(root, "summary"), text(root, "reveal"), text(root, "fullExplanation"));
            if (single == null) {
                return null;
            }
            enNode = root;
            zhNode = root;
        }
        String enText = summaryText(enNode);
        String zhText = summaryText(zhNode);
        if (isBlank(enText) || isBlank(zhText)) {
            return null;
        }
        return Map.of(
                "en", Map.of("summary", enText.trim()),
                "zh", Map.of("summary", zhText.trim())
        );
    }

    private static String summaryText(JsonNode node) {
        if (node == null || !node.isObject()) {
            return null;
        }
        return firstNonEmpty(text(node, "summary"), text(node, "reveal"), text(node, "fullExplanation"));
    }

    private static JsonNode parseRoot(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String s = raw.trim();
        int start = s.indexOf('{');
        int end = s.lastIndexOf('}');
        if (start >= 0 && end > start) {
            s = s.substring(start, end + 1);
        }
        try {
            return MAPPER.readTree(s);
        } catch (Exception e) {
            return null;
        }
    }

    private static JsonNode pickLocaleNode(JsonNode root, String... keys) {
        for (String key : keys) {
            JsonNode n = root.get(key);
            if (n != null && n.isObject()) {
                return n;
            }
        }
        for (var it = root.fields(); it.hasNext(); ) {
            var e = it.next();
            for (String key : keys) {
                if (e.getKey().equalsIgnoreCase(key) && e.getValue().isObject()) {
                    return e.getValue();
                }
            }
        }
        return null;
    }

    private static String text(JsonNode node, String field) {
        if (node == null || !node.has(field)) {
            return null;
        }
        JsonNode v = node.get(field);
        return v == null || v.isNull() ? null : v.asText();
    }

    private static String firstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return null;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    /** 归一化用户立场：builder | breaker | uncertain */
    public static String normalizeUserChoice(String raw) {
        if (raw == null) {
            return "uncertain";
        }
        String s = raw.trim().toLowerCase(Locale.ROOT);
        if ("builder".equals(s) || "breaker".equals(s) || "uncertain".equals(s)) {
            return s;
        }
        return "uncertain";
    }
}
