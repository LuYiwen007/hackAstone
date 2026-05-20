package org.hackastone.biz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 解析道德困境 Echo 返回的双语 JSON（turn / summary）。
 */
public final class DilemmaAiParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private DilemmaAiParser() {
    }

    public static Map<String, Object> parseTurn(String raw) {
        JsonNode root = parseRoot(raw);
        if (root == null || !root.isObject()) {
            return null;
        }
        JsonNode enNode = pickLocaleNode(root, "en", "english");
        JsonNode zhNode = pickLocaleNode(root, "zh", "chinese", "cn");
        if (enNode == null && zhNode == null && looksLikeTurn(root)) {
            enNode = root;
            zhNode = root;
        }
        Map<String, Object> en = toTurnMap(enNode);
        Map<String, Object> zh = toTurnMap(zhNode);
        if (en == null || zh == null) {
            return null;
        }
        return Map.of("en", en, "zh", zh);
    }

    public static Map<String, Object> parseSummary(String raw) {
        JsonNode root = parseRoot(raw);
        if (root == null || !root.isObject()) {
            return null;
        }
        JsonNode enNode = pickLocaleNode(root, "en", "english");
        JsonNode zhNode = pickLocaleNode(root, "zh", "chinese", "cn");
        if (enNode == null && zhNode == null && root.has("fullExplanation")) {
            enNode = root;
            zhNode = root;
        }
        String enText = text(enNode, "fullExplanation");
        String zhText = text(zhNode, "fullExplanation");
        if (isBlank(enText) || isBlank(zhText)) {
            return null;
        }
        return Map.of(
                "en", Map.of("fullExplanation", enText.trim()),
                "zh", Map.of("fullExplanation", zhText.trim())
        );
    }

    private static boolean looksLikeTurn(JsonNode node) {
        return node.has("philosopherReply") || node.has("philosopher_reply");
    }

    private static Map<String, Object> toTurnMap(JsonNode node) {
        if (node == null || !node.isObject()) {
            return null;
        }
        String philosopherReply = firstNonEmpty(text(node, "philosopherReply"), text(node, "philosopher_reply"));
        String judgeQuestion = firstNonEmpty(text(node, "judgeQuestion"), text(node, "judge_question"));
        if (isBlank(philosopherReply) || isBlank(judgeQuestion)) {
            return null;
        }
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("philosopherReply", philosopherReply.trim());
        map.put("judgeQuestion", judgeQuestion.trim());
        JsonNode cont = node.get("continueDebate");
        if (cont == null) {
            cont = node.get("continue_debate");
        }
        map.put("continueDebate", cont != null && cont.asBoolean());
        return map;
    }

    private static JsonNode parseRoot(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String trimmed = raw.trim();
        try {
            return MAPPER.readTree(trimmed);
        } catch (Exception ignored) {
            /* fall through */
        }
        String fenced = extractFencedJson(trimmed);
        if (fenced != null) {
            try {
                return MAPPER.readTree(fenced);
            } catch (Exception ignored) {
                return null;
            }
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return MAPPER.readTree(trimmed.substring(start, end + 1));
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

    private static String text(JsonNode node, String field) {
        if (node == null) {
            return null;
        }
        JsonNode v = node.get(field);
        if (v == null || v.isNull()) {
            return null;
        }
        return v.asText();
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
