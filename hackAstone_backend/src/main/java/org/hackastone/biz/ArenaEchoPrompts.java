package org.hackastone.biz;

/**
 * 认知竞技场 · CA-Echo-LLM 与百炼应用的输入/输出契约。
 * 与各 Agent 协议对齐：[ROLE] CA-Echo-LLM + [TASK] + [RETURN_FORMAT] json + 业务字段说明。
 * <p>
 * 注意：百炼「应用」内置系统提示必须与 [ROLE] 一致；echo-app-id 须指向 Echo 应用，不能填 Ledger/Forge 等。
 */
public final class ArenaEchoPrompts {

    public static final String ROLE = "CA-Echo-LLM";

    private ArenaEchoPrompts() {
    }

    /** 哲学辩题（/arena/agent/topic）— 对齐前端 {@code DebateTopicContent} */
    public static final String DEBATE_TOPIC_JSON_SCHEMA = "{"
            + "\"question\":\"string\","
            + "\"philosopherView\":\"string\","
            + "\"oppositeView\":\"string\","
            + "\"judgeQuestions\":[\"string\",\"string\",\"string\"],"
            + "\"fullExplanation\":\"string\""
            + "}";

    /** 辩论单轮（哲学辩论 / 道德困境 turn） */
    public static final String DEBATE_TURN_JSON_SCHEMA = "{"
            + "\"philosopherReply\":\"string\","
            + "\"judgeQuestion\":\"string\","
            + "\"continueDebate\":true"
            + "}";

    /** 辩论总结 */
    public static final String DEBATE_SUMMARY_JSON_SCHEMA = "{\"fullExplanation\":\"string\"}";

    private static final String DILEMMA_TURN_LOCALE_SCHEMA = "{"
            + "\"philosopherReply\":\"string\","
            + "\"judgeQuestion\":\"string\","
            + "\"continueDebate\":true"
            + "}";

    /** 道德困境单轮：双语 philosopherReply + judgeQuestion */
    public static final String DILEMMA_TURN_BILINGUAL_JSON_SCHEMA = "{"
            + "\"en\":" + DILEMMA_TURN_LOCALE_SCHEMA + ","
            + "\"zh\":" + DILEMMA_TURN_LOCALE_SCHEMA
            + "}";

    private static final String DILEMMA_SUMMARY_LOCALE_SCHEMA = "{\"fullExplanation\":\"string\"}";

    /** 道德困境总结：双语 fullExplanation */
    public static final String DILEMMA_SUMMARY_BILINGUAL_JSON_SCHEMA = "{"
            + "\"en\":" + DILEMMA_SUMMARY_LOCALE_SCHEMA + ","
            + "\"zh\":" + DILEMMA_SUMMARY_LOCALE_SCHEMA
            + "}";

    /** 圆桌消息（单语，已废弃，请用双语 schema） */
    public static final String ROUNDTABLE_JSON_SCHEMA = "{"
            + "\"messages\":[{\"speaker\":\"philosopherId\",\"content\":\"string\"}]"
            + "}";

    private static final String ROUNDTABLE_LOCALE_MESSAGES_SCHEMA = "{"
            + "\"messages\":[{\"speaker\":\"philosopherId\",\"content\":\"string\"}]"
            + "}";

    /** 圆桌开场/回应：一次返回中英文两套 messages */
    public static final String ROUNDTABLE_BILINGUAL_JSON_SCHEMA = "{"
            + "\"en\":" + ROUNDTABLE_LOCALE_MESSAGES_SCHEMA + ","
            + "\"zh\":" + ROUNDTABLE_LOCALE_MESSAGES_SCHEMA
            + "}";

    private static final String DISCIPLINE_BATTLE_LOCALE_SCHEMA = "{"
            + "\"question\":\"string\","
            + "\"category\":\"string\","
            + "\"builderView\":\"string\","
            + "\"breakerView\":\"string\","
            + "\"judgeQuestions\":[\"string\",\"string\",\"string\"],"
            + "\"reveal\":\"string\""
            + "}";

    /** 学科辩论 AI 出题：一次返回中英文两套（en + zh） */
    public static final String DISCIPLINE_BATTLE_BILINGUAL_JSON_SCHEMA = "{"
            + "\"en\":" + DISCIPLINE_BATTLE_LOCALE_SCHEMA + ","
            + "\"zh\":" + DISCIPLINE_BATTLE_LOCALE_SCHEMA
            + "}";

    private static String header(String task, String acceptance, String constraints, String returnSchema) {
        return "[ROLE]\n" + ROLE + "\n\n"
                + "[TASK]\n" + task + "\n\n"
                + "[REPO_CONTEXT]\nproject=hackAstone\n\n"
                + "[TARGET_FILES]\nNONE\n\n"
                + "[API_CONTRACT]\nNONE\n\n"
                + "[ACCEPTANCE_CRITERIA]\n" + acceptance + "\n\n"
                + "[CONSTRAINTS]\n" + constraints + "\n\n"
                + "[RETURN_FORMAT]\njson\n\n"
                + "[OUTPUT_JSON_SCHEMA]\n" + returnSchema + "\n\n"
                + "仅返回符合 OUTPUT_JSON_SCHEMA 的 JSON 对象，不要 markdown 代码块，不要额外说明文字。\n\n";
    }

    public static String debateTopic(String philosopherName, String school, String keyIdeas) {
        return header(
                "生成一场哲学辩论的辩题、双方立场、裁判追问与背景说明。",
                "必须包含且仅使用字段：question, philosopherView, oppositeView, judgeQuestions（至少3条）, fullExplanation",
                "中文；judgeQuestions 为字符串数组；字段名必须与 schema 完全一致",
                DEBATE_TOPIC_JSON_SCHEMA
        ) + "上下文：思想家=" + philosopherName + "；学派=" + school + "；关键思想=" + keyIdeas;
    }

    public static String debateTurn(String debateQuestion, String philosopherName, String school,
                                    String userStance, String history) {
        return header(
                "继续一轮哲学辩论：先以哲学家身份回应用户，再以 Judge 身份追问，并判断是否应结束辩论。",
                "必须包含：philosopherReply, judgeQuestion, continueDebate（布尔）",
                "中文；体现哲学家思想风格；continueDebate=false 表示可进入总结",
                DEBATE_TURN_JSON_SCHEMA
        ) + "辩题：" + debateQuestion + "\n"
                + "哲学家：" + philosopherName + "（" + school + "）\n"
                + "用户立场：" + userStance + "\n"
                + "历史：\n" + history;
    }

    public static String debateSummary(String debateQuestion, String philosopherName, String userStance,
                                       String history) {
        return header(
                "根据辩论历史生成完整总结解释。",
                "必须包含 fullExplanation（非空字符串）",
                "中文；条理清晰；保留哲学家风格",
                DEBATE_SUMMARY_JSON_SCHEMA
        ) + "辩题：" + debateQuestion + "\n"
                + "哲学家：" + philosopherName + "\n"
                + "用户立场：" + userStance + "\n"
                + "历史：\n" + history;
    }

    public static String roundtableOpenings(String topic, String participantsJson) {
        return header(
                "根据辩题为每位参与者生成一段开场发言，同时输出英文(en)与中文(zh)两套 messages。",
                "en.messages 与 zh.messages 长度相同、speaker 顺序一致且与参与者数量一致；speaker 为参与者 id；content 非空",
                "en 用自然英文，zh 用自然中文；每位思想家风格鲜明；每条 content 约 80-150 字",
                ROUNDTABLE_BILINGUAL_JSON_SCHEMA
        ) + "辩题：" + topic + "\n参与者：" + participantsJson + "\n"
                + "Example: {\"en\":{\"messages\":[{\"speaker\":\"plato\",\"content\":\"...\"}]},"
                + "\"zh\":{\"messages\":[{\"speaker\":\"plato\",\"content\":\"...\"}]}}";
    }

    public static String roundtableReply(String topic, String userInput, String participantsJson) {
        return header(
                "用户圆桌发言后，为每位参与者各生成一条回应，同时输出英文(en)与中文(zh)两套 messages。",
                "en.messages 与 zh.messages 一一对应；每位参与者一条；speaker 为 philosopherId",
                "en 用自然英文，zh 用自然中文；回应须针对用户发言；每条 content 约 60-120 字",
                ROUNDTABLE_BILINGUAL_JSON_SCHEMA
        ) + "辩题：" + topic + "\n用户发言：" + userInput + "\n参与者：" + participantsJson;
    }

    public static String dilemmaTurn(String title, String titleEn, String question, String promptLead,
                                     String userStance, String philosopherName, String school, String keyIdeas,
                                     String history) {
        return header(
                "围绕道德困境继续一轮讨论：同时输出英文(en)与中文(zh)两套 philosopherReply、judgeQuestion、continueDebate。",
                "en 与 zh 结构相同；continueDebate 布尔值两边一致；字段非空",
                "en 用自然英文，zh 用自然中文；哲学家回应体现其思想；各段约 80-150 字",
                DILEMMA_TURN_BILINGUAL_JSON_SCHEMA
        ) + "道德困境：" + title + " (" + titleEn + ")\n"
                + "问题：" + question + "\n"
                + "用户立场：" + userStance + "\n"
                + "哲学家：" + philosopherName + "；学派：" + school + "；关键思想：" + keyIdeas + "\n"
                + "讨论提醒：" + promptLead + "\n"
                + "历史：\n" + history;
    }

    /**
     * 学科辩论 AI 出题（/arena/agent/discipline/battle）— 一次生成中英文两套完整对局文案。
     */
    public static String disciplineBattle(String categoryEn, String categoryZh) {
        String task = "Generate ONE discipline debate match in Builder vs Breaker format, with FULL content in BOTH English (en) and Chinese (zh). "
                + "Each locale block must have: question, category, builderView, breakerView, judgeQuestions (exactly 3), reveal.";
        String acceptance = "Top-level keys must be exactly: en, zh. Each block must include all fields with non-empty strings; judgeQuestions length 3.";
        String constraints = "en block entirely in English; zh block entirely in Chinese; same debate topic and logical structure in both; "
                + "builderView = Builder stance; breakerView = Breaker stance; reveal transcends false binary; field names match schema";
        return header(task, acceptance, constraints, DISCIPLINE_BATTLE_BILINGUAL_JSON_SCHEMA)
                + "Category (English label for en.category): " + categoryEn + "\n"
                + "Category (Chinese label for zh.category): " + categoryZh + "\n"
                + "If category is General/全部, pick any compelling domain and use matching category labels in en/zh.\n"
                + "Example shape (content must be your own):\n"
                + "{\"en\":{\"question\":\"...\",\"category\":\"Business\",\"builderView\":\"...\",\"breakerView\":\"...\","
                + "\"judgeQuestions\":[\"?\",\"?\",\"?\"],\"reveal\":\"...\"},"
                + "\"zh\":{\"question\":\"...\",\"category\":\"商业\",\"builderView\":\"...\",\"breakerView\":\"...\","
                + "\"judgeQuestions\":[\"？\",\"？\",\"？\"],\"reveal\":\"...\"}}\n"
                + "Keep each view 80-150 words; reveal 120-200 words; output ONLY the JSON object.";
    }

    public static String dilemmaSummary(String title, String question, String userStance,
                                        String philosopherName, String school, String history) {
        return header(
                "根据道德困境讨论历史生成完整总结，同时输出英文(en)与中文(zh)两套 fullExplanation。",
                "en.fullExplanation 与 zh.fullExplanation 均非空",
                "en 用自然英文，zh 用自然中文；解释用户立场与哲学家回应的张力；各约 150-250 字",
                DILEMMA_SUMMARY_BILINGUAL_JSON_SCHEMA
        ) + "道德困境：" + title + "\n"
                + "问题：" + question + "\n"
                + "用户立场：" + userStance + "\n"
                + "哲学家：" + philosopherName + "；学派：" + school + "\n"
                + "历史：\n" + history;
    }
}
