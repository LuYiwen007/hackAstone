package org.hackastone.biz;

import java.util.Locale;

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

    /**
     * 哲学辩论单轮：用户与哲学家直接辩论（philosopherReplyToUser 每轮必填）；
     * Judge 可选介入引导双方，addressTo 仅表示裁判本轮主要追问谁，不取消哲学家对用户的发言。
     */
    public static final String PHILOSOPHY_DEBATE_TURN_JSON_SCHEMA = "{"
            + "\"philosopherReplyToUser\":\"string\","
            + "\"judgeSpeaks\":true,"
            + "\"judgeMessage\":\"string\","
            + "\"addressTo\":\"user|philosopher\","
            + "\"philosopherReplyToJudge\":\"string\","
            + "\"continueDebate\":true"
            + "}";

    /** @deprecated 道德困境等旧路径；哲学辩论请用 PHILOSOPHY_DEBATE_TURN_JSON_SCHEMA */
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
                "用户与哲学家进行直接辩论。本轮用户已发言，你必须："
                        + "① 在 philosopherReplyToUser 中让哲学家第一人称回应用户（每轮必填，这是主辩论线）。"
                        + "② 你作为 Judge 阅读双方交锋，决定是否介入（judgeSpeaks）；若介入，用 judgeMessage 引导双方，"
                        + "addressTo 表示本轮追问重点（user= mainly 向用户追问，philosopher= mainly 向哲学家追问）。"
                        + "禁止因 addressTo=user 而让哲学家沉默；用户与哲学家的对辩每轮都要继续。"
                        + "judgeSpeaks=false：judgeMessage=\"\"，philosopherReplyToJudge=\"\"。"
                        + "judgeSpeaks=true 且 addressTo=user：追问/引导用户，philosopherReplyToJudge=\"\"。"
                        + "judgeSpeaks=true 且 addressTo=philosopher：philosopherReplyToJudge 必填，回应 judgeMessage 中对哲学家的追问。",
                "philosopherReplyToUser 每轮非空；judgeSpeaks 布尔；continueDebate 布尔",
                "中文；哲学家第一人称；continueDebate=false 可进入总结",
                PHILOSOPHY_DEBATE_TURN_JSON_SCHEMA
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

    private static final String ROUNDTABLE_EDUCATION_CONTEXT =
            "场景：hackAstone 认知竞技场学术哲学圆桌，面向教育讨论；内容须文明、理性、学术化，"
                    + "避免暴力、色情、仇恨、违法及敏感政治煽动表述。";

    public static String roundtableOpenings(String topic, String participantsJson) {
        return roundtableOpenings(topic, participantsJson, false);
    }

    public static String roundtableOpenings(String topic, String participantsJson, boolean compact) {
        String task = compact
                ? "为每位哲学家参与者各生成一段简短圆桌开场，同时输出 en 与 zh 两套 messages。"
                : "根据辩题为每位哲学家参与者生成一段开场发言，同时输出英文(en)与中文(zh)两套 messages。";
        String acceptance = compact
                ? "en/zh messages 数量与参与者一致；speaker 为参与者 id；content 非空"
                : "en.messages 与 zh.messages 长度相同、speaker 顺序一致且与参与者数量一致；speaker 为参与者 id；content 非空";
        String constraints = compact
                ? ROUNDTABLE_EDUCATION_CONTEXT + "；仅 JSON；每条 50-90 字"
                : ROUNDTABLE_EDUCATION_CONTEXT + "；en 自然英文，zh 自然中文；每位哲学家风格鲜明；每条 80-120 字";
        return header(task, acceptance, constraints, ROUNDTABLE_BILINGUAL_JSON_SCHEMA)
                + "辩题：" + topic + "\n参与者：" + participantsJson + "\n"
                + "Example: {\"en\":{\"messages\":[{\"speaker\":\"plato\",\"content\":\"...\"}]},"
                + "\"zh\":{\"messages\":[{\"speaker\":\"plato\",\"content\":\"...\"}]}}";
    }

    public static String roundtableReply(String topic, String userInput, String participantsJson) {
        return roundtableReply(topic, userInput, participantsJson, false);
    }

    /** 单哲学家发言（流式纯文本，按 locale 只输出一种语言） */
    public static final String ROUNDTABLE_SPEECH_JSON_SCHEMA = "{\"content\":\"string\"}";

    public static String roundtablePhilosopherOpening(
            String topic,
            String philosopherId,
            String philosopherName,
            String school,
            String keyIdeas,
            String summary,
            String history,
            String locale) {
        boolean en = locale != null && locale.toLowerCase(Locale.ROOT).startsWith("en");
        String lang = en ? "English" : "Chinese";
        String task = "You ARE " + philosopherName + " (" + school + ") at a roundtable—not a generic AI moderator. "
                + "Deliver YOUR opening view on the topic in your historical voice only."
                + (en ? "" : " 完全代入该哲学家本人，不是「扮演」的统一样板。");
        String constraints = roundtableSpeechConstraints(en, lang, true);
        String tail = roundtableSpeechContext(topic, keyIdeas, summary, history, null, philosopherId, philosopherName, school);
        return headerPlainSpeech(task, "Distinct in-character speech; non-empty", constraints, tail);
    }

    /** 哲学辩论：哲学家流式回应用户（纯文本，人设同圆桌） */
    public static String philosophyPhilosopherToUser(
            String debateQuestion,
            String philosopherId,
            String philosopherName,
            String school,
            String keyIdeas,
            String summary,
            String userStance,
            String history,
            String locale) {
        boolean en = locale != null && locale.toLowerCase(Locale.ROOT).startsWith("en");
        String lang = en ? "English" : "Chinese";
        String task = "You ARE " + philosopherName + " (" + school + ") in a direct philosophy debate with the user. "
                + "The user just spoke—reply in YOUR historical voice only. Do NOT speak as Judge."
                + (en ? "" : " 第一人称对辩，勿裁判口吻，勿 JSON。");
        String constraints = roundtableSpeechConstraints(en, lang, false);
        String tail = philosophySpeechContext(
                debateQuestion, userStance, keyIdeas, summary, history, null,
                philosopherId, philosopherName, school);
        return headerPlainSpeech(task, "Distinct in-character reply; non-empty", constraints, tail);
    }

    /** 哲学辩论：哲学家流式回应 Judge 追问（纯文本） */
    public static String philosophyPhilosopherToJudge(
            String debateQuestion,
            String philosopherId,
            String philosopherName,
            String school,
            String keyIdeas,
            String summary,
            String userStance,
            String history,
            String locale) {
        boolean en = locale != null && locale.toLowerCase(Locale.ROOT).startsWith("en");
        String lang = en ? "English" : "Chinese";
        String task = "You ARE " + philosopherName + " (" + school + "). The Judge has just questioned you "
                + "(see last Judge line in history). Reply to the Judge in first person only—not to re-argue with the user."
                + (en ? "" : " 仅回应裁判追问，勿重复上一轮对用户的全文。");
        String constraints = roundtableSpeechConstraints(en, lang, false);
        String tail = philosophySpeechContext(
                debateQuestion, userStance, keyIdeas, summary, history, null,
                philosopherId, philosopherName, school);
        return headerPlainSpeech(task, "Distinct in-character reply to Judge; non-empty", constraints, tail);
    }

    private static String philosophySpeechContext(
            String debateQuestion,
            String userStance,
            String keyIdeas,
            String summary,
            String history,
            String latestUserLine,
            String philosopherId,
            String philosopherName,
            String school) {
        StringBuilder sb = new StringBuilder();
        sb.append("[PERSONA_VOICE]\n").append(roundtablePersonaVoice(philosopherId, philosopherName, school, keyIdeas));
        if (summary != null && !summary.isBlank()) {
            sb.append("\n人物背景（仅供把握语气，勿照抄）：").append(summary.trim());
        }
        sb.append("\n\n辩题：").append(debateQuestion).append("\n");
        sb.append("用户立场：").append(userStance).append("\n");
        if (keyIdeas != null && !keyIdeas.isBlank()) {
            sb.append("你的核心思想：").append(keyIdeas).append("\n");
        }
        if (latestUserLine != null && !latestUserLine.isBlank()) {
            sb.append("用户本轮发言：").append(latestUserLine).append("\n");
        }
        if (history != null && !history.isBlank()) {
            sb.append("对话历史：\n").append(history).append("\n");
        }
        return sb.toString();
    }

    public static String roundtablePhilosopherReply(
            String topic,
            String userInput,
            String philosopherId,
            String philosopherName,
            String school,
            String keyIdeas,
            String summary,
            String history,
            String locale) {
        boolean en = locale != null && locale.toLowerCase(Locale.ROOT).startsWith("en");
        String lang = en ? "English" : "Chinese";
        String task = "You ARE " + philosopherName + " (" + school + "). The user interjected at the roundtable. "
                + "Respond in YOUR voice; you may disagree with other philosophers using YOUR concepts—not theirs."
                + (en ? "" : " 用本派概念回应，勿复述他人话语的句式或术语堆砌。");
        String constraints = roundtableSpeechConstraints(en, lang, false);
        String tail = roundtableSpeechContext(topic, keyIdeas, summary, history, userInput, philosopherId, philosopherName, school);
        return headerPlainSpeech(task, "Distinct in-character reply; non-empty", constraints, tail);
    }

    private static String roundtableSpeechConstraints(boolean en, String lang, boolean opening) {
        String len = opening ? (en ? "about 70-110 words" : "约 70-110 字") : (en ? "about 55-95 words" : "约 55-95 字");
        String anti = en
                ? "FORBIDDEN for all speakers: identical openings (e.g. 'Dear colleagues'), self-intro formula "
                        + "('I am X'), numbered manifesto of book titles, closing 'let us rationally discuss', "
                        + "or copying another philosopher's sentence skeleton from the history. "
                        + "Do NOT import the other school's jargon (e.g. Zhuangzi must not use Aristotle's four causes)."
                : "严禁千篇一律：一律「诸位同仁」开场、一律「我是/吾乃某某」自报家门、一律罗列多部著作名、"
                        + "一律「愿我们以理性对话/探讨」收尾、模仿上一轮他人的段落结构。"
                        + "严禁跨派术语生搬（如庄子不用四因说/形式因，亚里士多德不用齐物/逍遥）。";
        return ROUNDTABLE_EDUCATION_CONTEXT + "；" + lang + " only；第一人称；" + len + "；"
                + anti + "；" + (opening ? "" : "须回应用户具体观点。");
    }

    private static String roundtableSpeechContext(
            String topic,
            String keyIdeas,
            String summary,
            String history,
            String userInput,
            String philosopherId,
            String philosopherName,
            String school) {
        StringBuilder sb = new StringBuilder();
        sb.append("[PERSONA_VOICE]\n").append(roundtablePersonaVoice(philosopherId, philosopherName, school, keyIdeas));
        if (summary != null && !summary.isBlank()) {
            sb.append("\n人物背景（仅供把握语气，勿照抄）：").append(summary.trim());
        }
        sb.append("\n\n辩题：").append(topic).append("\n");
        if (keyIdeas != null && !keyIdeas.isBlank()) {
            sb.append("你的核心思想（发言须由此生长，而非贴标签）：").append(keyIdeas).append("\n");
        }
        if (userInput != null && !userInput.isBlank()) {
            sb.append("用户发言：").append(userInput).append("\n");
        }
        if (history != null && !history.isBlank()) {
            sb.append("已有发言（可反驳或借鉴，但不得克隆其文风）：\n").append(history).append("\n");
        }
        return sb.toString();
    }

    /** 按哲学家 id 约束语言人设；未知 id 则按学派回退 */
    private static String roundtablePersonaVoice(
            String philosopherId, String philosopherName, String school, String keyIdeas) {
        String id = philosopherId == null ? "" : philosopherId.trim().toLowerCase(Locale.ROOT);
        switch (id) {
            case "zhuangzi":
                return "庄子：先秦道家寓言体。多用比喻、反问、游心之言；自称「吾」即可，不必现代会议腔。"
                        + "从齐物、逍遥、梦蝶、无用之用切入辩题；语气空灵幽默，忌儒家礼教腔与西式逻辑罗列。";
            case "laozi":
                return "老子：玄妙简练，近《道德经》句法。重「道」「无为」「柔弱胜刚强」；少论证多格言，"
                        + "忌长篇自辩与「诸位同仁」式开场。";
            case "confucius":
                return "孔子：温和教诲、重仁礼中庸。可引《论语》语感（子曰…），先问后立，重人伦实践；"
                        + "忌道家玄谈与西方形而上学术语。";
            case "mengzi":
                return "孟子：雄辩而重义，性善、仁政、民贵君轻。善用譬喻（如「赤子」「浩然之气」）；"
                        + "语气刚直恳切，忌庄子式齐物玄语。";
            case "aristotle":
                return "亚里士多德：分析论证体。定义—分殊—四因/目的论—例证；冷静务实，可称「我们」论究；"
                        + "忌庄子寓言、忌现代口号式收尾。";
            case "plato":
                return "柏拉图：对话体哲思，重理念、灵魂、正义。可用反问与神话譬喻（洞穴等）；"
                        + "语气庄重思辨，忌经验科学报告体。";
            case "socrates":
                return "苏格拉底：反诘、知无知、追问定义；短句连环提问，少下结论多揭示矛盾；"
                        + "忌长篇说教与系统形而上学罗列。";
            case "kant":
                return "康德：审慎、区分先验/经验、自律与道德律。可用「应当」「条件」等哲学术语但须清晰；"
                        + "忌诗意寓言与口语化动员。";
            case "nietzsche":
                return "尼采：格言、隐喻、锋利反讽。可宣告式、打破偶像；权力意志/超人/价值重估；"
                        + "忌学院派八股与道德说教收尾。";
            case "descartes":
                return "笛卡尔：从怀疑出发，清晰分明；我思故我在式确定性；理性、方法论；忌先秦诸子口吻。";
            case "hegel":
                return "黑格尔：辩证、历史理性、正反合；概念推演，宏大叙事；忌碎片化格言体。";
            case "marx":
                return "马克思：历史唯物主义、阶级与实践；批判资本与意识形态；重现实变革，忌纯玄学思辨。";
            case "buddha":
            case "siddhartha":
                return "释迦牟尼：缘起、苦集灭道、中道。慈悲简净，少争论好胜；用解脱、执念、空性观照辩题；"
                        + "忌辩赢式的雄辩。";
            case "heidegger":
                return "海德格尔：存在之问、此在、技艺与技术批判。幽深概念（在世、本真），节奏沉缓；"
                        + "忌浅白动员口号。";
            case "sartre":
                return "萨特：存在先于本质、自由与责任、荒诞。直白介入存在体验；忌系统经院体。";
            case "foucault":
                return "福柯：权力/知识、谱系学、话语实践。分析制度如何形塑主体；冷静拆解，忌道德预言。";
            default:
                return personaVoiceBySchool(philosopherName, school, keyIdeas);
        }
    }

    private static String personaVoiceBySchool(String philosopherName, String school, String keyIdeas) {
        String s = school == null ? "" : school;
        if (s.contains("道家")) {
            return philosopherName + "：道家语脉—玄妙、比喻、无为、道法自然；忌儒家的礼教训诫腔与西方分析哲学体例。";
        }
        if (s.contains("儒家")) {
            return philosopherName + "：儒家语脉—仁义、教化、修身、经世；重人伦具体，忌道家齐物玄谈与西方纯逻辑体。";
        }
        if (s.contains("古希腊") || s.contains("Greek")) {
            return philosopherName + "：古希腊语脉—论证、定义、对话或体系思辨；可用逻辑与城邦伦理，忌先秦诸子句式。";
        }
        if (s.contains("德国") || s.contains("German")) {
            return philosopherName + "：德国古典/近代哲学习惯—概念严谨、体系或批判；忌先秦口语与统一「同仁」开场。";
        }
        return philosopherName + "（" + s + "）：发言须符合其所处时代与学派语感，避免现代会议主持人口吻。"
                + (keyIdeas != null && !keyIdeas.isBlank() ? " 思想资源：" + keyIdeas : "");
    }


    private static String headerPlainSpeech(String task, String acceptance, String constraints, String tail) {
        return "[ROLE]\n" + ROLE + "\n\n"
                + "[TASK]\n" + task + "\n\n"
                + "[REPO_CONTEXT]\nproject=hackAstone\n\n"
                + "[TARGET_FILES]\nNONE\n\n"
                + "[API_CONTRACT]\nNONE\n\n"
                + "[ACCEPTANCE_CRITERIA]\n" + acceptance + "\n\n"
                + "[CONSTRAINTS]\n" + constraints + "\n\n"
                + "[RETURN_FORMAT]\ntext\n\n"
                + "仅返回该哲学家发言正文（纯文本），不要 JSON，不要 markdown 代码块，不要 speaker 标签。\n\n"
                + tail;
    }

    public static String roundtableReply(String topic, String userInput, String participantsJson, boolean compact) {
        String task = compact
                ? "用户圆桌发言后，为每位哲学家各生成一条简短回应，输出 en/zh messages。"
                : "用户圆桌发言后，为每位哲学家参与者各生成一条回应，同时输出英文(en)与中文(zh)两套 messages。";
        String constraints = compact
                ? ROUNDTABLE_EDUCATION_CONTEXT + "；仅 JSON；每条 50-80 字"
                : ROUNDTABLE_EDUCATION_CONTEXT + "；en 自然英文，zh 自然中文；回应须针对用户发言；每条 60-100 字";
        return header(
                task,
                "en.messages 与 zh.messages 一一对应；每位参与者一条；speaker 为参与者 id",
                constraints,
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
