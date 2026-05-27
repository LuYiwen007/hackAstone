package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 解析百炼 Echo 返回的学科辩论 JSON（兼容 markdown 围栏、en/zh 别名、字段别名）。
 */
public final class DisciplineBattleParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private DisciplineBattleParser() {
    }

    public static Map<String, Object> parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        JsonNode root = parseRoot(raw.trim());
        if (root == null || !root.isObject()) {
            return null;
        }
        JsonNode enNode = pickLocaleNode(root, "en", "english", "en_US", "en-us");
        JsonNode zhNode = pickLocaleNode(root, "zh", "chinese", "cn", "zh_CN", "zh-cn");
        if (enNode == null && zhNode == null && looksLikeLocaleSlice(root)) {
            enNode = root;
            zhNode = root;
        }
        Map<String, Object> en = toLocaleMap(enNode);
        Map<String, Object> zh = toLocaleMap(zhNode);
        if (en == null || zh == null) {
            return null;
        }
        return Map.of("en", en, "zh", zh);
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

    private static boolean looksLikeLocaleSlice(JsonNode node) {
        return node.has("question") && (node.has("builderView") || node.has("builder_view"));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> toLocaleMap(JsonNode node) {
        if (node == null || !node.isObject()) {
            return null;
        }
        String question = text(node, "question");
        String category = text(node, "category");
        String builderView = firstNonEmpty(text(node, "builderView"), text(node, "builder_view"));
        String breakerView = firstNonEmpty(text(node, "breakerView"), text(node, "breaker_view"));
        String reveal = text(node, "reveal");
        List<String> judgeQuestions = readJudgeQuestions(node);
        if (isBlank(question) || isBlank(builderView) || isBlank(breakerView) || isBlank(reveal)) {
            return null;
        }
        if (judgeQuestions.size() < 3) {
            return null;
        }
        if (isBlank(category)) {
            category = "General";
        }
        return MAPPER.convertValue(
                Map.of(
                        "question", question.trim(),
                        "category", category.trim(),
                        "builderView", builderView.trim(),
                        "breakerView", breakerView.trim(),
                        "judgeQuestions", judgeQuestions.subList(0, 3),
                        "reveal", reveal.trim()
                ),
                new TypeReference<Map<String, Object>>() {}
        );
    }

    private static List<String> readJudgeQuestions(JsonNode node) {
        List<String> out = new ArrayList<>();
        JsonNode arr = node.get("judgeQuestions");
        if (arr == null) {
            arr = node.get("judge_questions");
        }
        if (arr != null && arr.isArray()) {
            for (JsonNode item : arr) {
                if (item.isTextual()) {
                    String s = item.asText().trim();
                    if (!s.isEmpty()) {
                        out.add(s);
                    }
                }
            }
        }
        return out;
    }

    private static String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) {
            return null;
        }
        if (v.isTextual()) {
            return v.asText();
        }
        return v.asText("");
    }

    private static String firstNonEmpty(String a, String b) {
        if (!isBlank(a)) {
            return a;
        }
        return b;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
