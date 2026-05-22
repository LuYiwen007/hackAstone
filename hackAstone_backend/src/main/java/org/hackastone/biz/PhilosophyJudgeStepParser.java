package org.hackastone.biz;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 哲学辩论 Judge 步：解析纯文本流式输出（含 [NO_JUDGE]、META: 尾行）或兼容 JSON。
 */
public final class PhilosophyJudgeStepParser {

    static final String NO_JUDGE = "[NO_JUDGE]";
    private static final Pattern META_LINE = Pattern.compile("(?m)^META:\\s*(\\{.*\\})\\s*$");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private PhilosophyJudgeStepParser() {
    }

    public static Map<String, Object> parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return silentStep(true);
        }
        String cleaned = trimTrailingDashScopeMetadata(raw.trim());
        Map<String, Object> fromJson = parseJsonObject(cleaned);
        if (fromJson != null) {
            return fromJson;
        }
        return parsePlainText(cleaned);
    }

    /** 流式展示用：去掉 META 尾行与 [NO_JUDGE] 标记 */
    public static String displayMessage(String accumulated) {
        if (accumulated == null || accumulated.isBlank()) {
            return "";
        }
        String s = accumulated;
        int metaIdx = indexOfMetaLine(s);
        if (metaIdx >= 0) {
            s = s.substring(0, metaIdx);
        }
        s = s.trim();
        if (NO_JUDGE.equals(s) || s.startsWith(NO_JUDGE)) {
            return "";
        }
        return s;
    }

    private static Map<String, Object> parsePlainText(String full) {
        if (NO_JUDGE.equals(full.trim())) {
            return silentStep(true);
        }
        String messagePart = full;
        String addressTo = "user";
        boolean continueDebate = true;

        Matcher m = META_LINE.matcher(full);
        if (m.find()) {
            messagePart = full.substring(0, m.start()).trim();
            try {
                JsonNode meta = MAPPER.readTree(m.group(1));
                if (meta.has("addressTo")) {
                    String at = meta.get("addressTo").asText("").trim().toLowerCase(Locale.ROOT);
                    if ("philosopher".equals(at) || "user".equals(at)) {
                        addressTo = at;
                    }
                }
                if (meta.has("continueDebate") && !meta.get("continueDebate").asBoolean(true)) {
                    continueDebate = false;
                }
            } catch (Exception ignored) {
                /* keep defaults */
            }
        }

        if (NO_JUDGE.equals(messagePart) || messagePart.isEmpty()) {
            return silentStep(continueDebate);
        }

        return Map.of(
                "judgeSpeaks", true,
                "judgeMessage", messagePart,
                "addressTo", addressTo,
                "continueDebate", continueDebate
        );
    }

    private static Map<String, Object> parseJsonObject(String cleaned) {
        JsonNode root = parseRoot(cleaned);
        if (root == null || !root.isObject()) {
            return null;
        }
        if (!root.has("judgeSpeaks") && !root.has("judgeMessage") && !root.has("judgeQuestion")) {
            return null;
        }
        boolean judgeSpeaks = root.path("judgeSpeaks").asBoolean(false);
        String judgeMessage = firstNonEmpty(
                text(root, "judgeMessage"),
                text(root, "judgeQuestion")
        );
        if (!judgeSpeaks && judgeMessage.isBlank()) {
            return silentStep(root.path("continueDebate").asBoolean(true));
        }
        if (!judgeSpeaks && !judgeMessage.isBlank()) {
            judgeSpeaks = true;
        }
        String addressTo = text(root, "addressTo").toLowerCase(Locale.ROOT);
        if (!"philosopher".equals(addressTo) && !"user".equals(addressTo)) {
            addressTo = "user";
        }
        if (judgeSpeaks && judgeMessage.isBlank()) {
            return null;
        }
        boolean continueDebate = root.path("continueDebate").asBoolean(true);
        if (!judgeSpeaks) {
            return silentStep(continueDebate);
        }
        return Map.of(
                "judgeSpeaks", true,
                "judgeMessage", judgeMessage.trim(),
                "addressTo", addressTo,
                "continueDebate", continueDebate
        );
    }

    private static Map<String, Object> silentStep(boolean continueDebate) {
        return Map.of(
                "judgeSpeaks", false,
                "judgeMessage", "",
                "addressTo", "",
                "continueDebate", continueDebate
        );
    }

    private static int indexOfMetaLine(String s) {
        int idx = s.lastIndexOf("\nMETA:");
        if (idx < 0 && s.startsWith("META:")) {
            return 0;
        }
        return idx >= 0 ? idx : s.indexOf("META:");
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
            return null;
        }
    }

    private static String text(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) {
            return "";
        }
        return node.get(field).asText("").trim();
    }

    private static String firstNonEmpty(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        return b == null ? "" : b;
    }
}
