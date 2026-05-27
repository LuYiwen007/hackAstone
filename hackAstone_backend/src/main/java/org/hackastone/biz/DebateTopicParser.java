package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 解析哲学辩题 JSON（兼容 markdown 围栏、字段别名、流式尾包残留）。
 */
public final class DebateTopicParser {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private DebateTopicParser() {
    }

    public static Map<String, Object> parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String cleaned = trimTrailingDashScopeMetadata(raw.trim());
        JsonNode root = parseRoot(cleaned);
        if (root == null || !root.isObject()) {
            return null;
        }
        String question = text(root, "question");
        String philosopherView = firstNonEmpty(text(root, "philosopherView"), text(root, "philosopher_view"));
        String oppositeView = firstNonEmpty(text(root, "oppositeView"), text(root, "opposite_view"));
        String fullExplanation = firstNonEmpty(text(root, "fullExplanation"), text(root, "full_explanation"));
        List<String> judgeQuestions = readJudgeQuestions(root);
        if (isBlank(question) || isBlank(philosopherView) || isBlank(oppositeView)) {
            return null;
        }
        while (judgeQuestions.size() < 3) {
            judgeQuestions.add("请进一步阐述你的立场与理由。");
        }
        if (isBlank(fullExplanation)) {
            fullExplanation = question;
        }
        return MAPPER.convertValue(
                Map.of(
                        "question", question.trim(),
                        "philosopherView", philosopherView.trim(),
                        "oppositeView", oppositeView.trim(),
                        "judgeQuestions", judgeQuestions.subList(0, Math.min(judgeQuestions.size(), 5)),
                        "fullExplanation", fullExplanation.trim()
                ),
                new TypeReference<Map<String, Object>>() {}
        );
    }

    private static String trimTrailingDashScopeMetadata(String fullText) {
        int cut = fullText.indexOf("}{\"output\"");
        if (cut > 0) {
            return fullText.substring(0, cut + 1);
        }
        cut = fullText.indexOf("\n{\"output\"");
        if (cut > 0) {
            return fullText.substring(0, cut).trim();
        }
        return fullText;
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
        int end = findBalancedObjectEnd(raw, start);
        if (start >= 0 && end > start) {
            try {
                return MAPPER.readTree(raw.substring(start, end + 1));
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private static int findBalancedObjectEnd(String raw, int start) {
        if (start < 0) {
            return -1;
        }
        int depth = 0;
        boolean inString = false;
        boolean escape = false;
        for (int i = start; i < raw.length(); i++) {
            char c = raw.charAt(i);
            if (inString) {
                if (escape) {
                    escape = false;
                } else if (c == '\\') {
                    escape = true;
                } else if (c == '"') {
                    inString = false;
                }
                continue;
            }
            if (c == '"') {
                inString = true;
            } else if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return i;
                }
            }
        }
        return -1;
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
