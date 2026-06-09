package org.hackastone.controller;

import org.hackastone.base.util.Result;
import org.hackastone.base.util.auth.UserContext;
import org.hackastone.biz.ArenaDataService;
import org.hackastone.biz.ArenaEchoPrompts;
import org.hackastone.biz.BailianAgentService;
import org.hackastone.biz.DebateTopicParser;
import org.hackastone.biz.DisciplineBattleParser;
import org.hackastone.biz.DilemmaAiParser;
import org.hackastone.biz.RoundtableMessagesParser;
import org.hackastone.biz.RoundtableRequestSupport;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.hackastone.base.util.constants.ResultEnum;
import org.hackastone.biz.BattleRecordService;
import org.hackastone.biz.UserNoteService;
import org.hackastone.biz.UserProfileService;
import org.hackastone.base.dal.entity.UserNoteEntity;
import org.hackastone.config.BailianAgentConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/arena")
public class ArenaController {

    @Autowired
    private ArenaDataService arenaDataService;
    @Autowired
    private BailianAgentService bailianAgentService;
    @Autowired
    private BailianAgentConfig bailianAgentConfig;
    @Autowired
    private UserProfileService userProfileService;
    @Autowired
    private BattleRecordService battleRecordService;
    @Autowired
    private UserNoteService userNoteService;

    /**
     * 百炼连接相关配置自检（不返回密钥，仅便于排查「连不上」类问题）
     */
    @GetMapping("/llm/diagnostics")
    public Result<Map<String, Object>> llmDiagnostics() {
        String key = bailianAgentConfig.getApiKey();
        boolean hasKey = key != null && !key.trim().isEmpty();
        String echoId = bailianAgentConfig.getEchoAppId();
        String echoTrim = echoId == null ? "" : echoId.trim();
        Map<String, Object> m = new HashMap<>();
        m.put("endpoint", bailianAgentConfig.getEndpoint());
        m.put("timeoutMs", bailianAgentConfig.getTimeoutMs());
        m.put("apiKeyConfigured", hasKey);
        m.put("echoAppIdConfigured", !echoTrim.isEmpty());
        m.put("echoAppIdSuffix", echoTrim.length() < 4 ? "" : echoTrim.substring(echoTrim.length() - 4));
        m.put("echoAppIdPrefix", echoTrim.length() < 4 ? echoTrim : echoTrim.substring(0, 4));
        m.put("echoAppIdLength", echoTrim.length());
        boolean endpointOk = bailianAgentConfig.getEndpoint() != null
                && bailianAgentConfig.getEndpoint().contains("/apps");
        m.put("endpointContainsAppsPath", endpointOk);
        boolean uuidLike = echoTrim.matches("(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
                || echoTrim.matches("(?i)[0-9a-f]{32}");
        m.put("echoAppIdUuidShape", uuidLike);
        if (hasKey && key != null) {
            String kt = key.trim();
            m.put("apiKeyLooksLikeDashScope", kt.startsWith("sk-") && kt.length() > 10);
        } else {
            m.put("apiKeyLooksLikeDashScope", false);
        }
        String ws = bailianAgentConfig.getWorkspaceId();
        boolean wsOk = ws != null && !ws.trim().isEmpty();
        m.put("workspaceIdConfigured", wsOk);
        String echoCompact = echoTrim.replace("-", "").toLowerCase(Locale.ROOT);
        boolean bundledDefaultEcho = "d2756fe8a8c1491c8103a5fc50505c8d".equals(echoCompact);
        m.put("echoAppIdIsBundledTemplateDefault", bundledDefaultEcho);
        if (bundledDefaultEcho && wsOk) {
            m.put("appAccessDeniedLikelyCause",
                    "已配置子业务空间，但 echo-app-id 仍是仓库内置示例 ID（d275…5c8d）。请改为你在 hackAstone 空间内该应用的 APP_ID（application.yml 的 bailian.echo-app-id 或环境变量 BAILIAN_ECHO_APP_ID），然后重启后端。");
        }
        m.put("hint", "若仍报 AppId invalid：(1) 国内/国际 endpoint 与 Key、应用地域一致。(2) 应用在「子业务空间」时须设 bailian.workspace-id 或 BAILIAN_WORKSPACE_ID。(3) IDE 启动须在 Run 里配环境变量。(4) 见百炼文档：获取 Workspace ID、应用调用 HTTP。");
        return Result.success(m);
    }

    /**
     * 认知竞技场静态数据：思想家、地区、时间轴、学科辩题、哲学辩题文案
     */
    @GetMapping("/i18n")
    public Result<Map<String, Object>> i18n(@org.springframework.web.bind.annotation.RequestParam(value = "locale", defaultValue = "en") String locale) {
        return Result.success(arenaDataService.getI18nPayload(locale));
    }

    @GetMapping("/catalog")
    public Result<Map<String, Object>> catalog(
            @org.springframework.web.bind.annotation.RequestParam(value = "locale", defaultValue = "en") String locale) {
        return Result.success(arenaDataService.getCatalog(locale));
    }

    /**
     * 保存对局记录
     */
    @PostMapping("/battle/record")
    public Result<String> saveBattleRecord(@RequestBody Map<String, Object> request) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }

        org.hackastone.base.dal.entity.BattleRecordEntity record = new org.hackastone.base.dal.entity.BattleRecordEntity();
        record.setUserId(userId);
        record.setBattleType(String.valueOf(request.getOrDefault("battleType", "battle")));
        record.setTopic(String.valueOf(request.getOrDefault("topic", "")));
        record.setUserChoice(String.valueOf(request.getOrDefault("userChoice", "")));
        record.setJudgeSummary(String.valueOf(request.getOrDefault("judgeSummary", "")));
        record.setChangedStance(Boolean.TRUE.equals(request.get("changedStance")) ? 1 : 0);
        Object messages = request.get("messages");
        Object profileI18n = request.get("profileI18n");
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            if (profileI18n != null) {
                Map<String, Object> wrapper = new java.util.LinkedHashMap<>();
                wrapper.put("profileI18n", profileI18n);
                if (messages != null) {
                    wrapper.put("chat", messages);
                }
                record.setMessages(mapper.writeValueAsString(wrapper));
            } else if (messages != null) {
                record.setMessages(mapper.writeValueAsString(messages));
            }
        } catch (Exception e) {
            record.setMessages(null);
        }

        battleRecordService.saveRecord(record);
        return Result.success(record.getId());
    }

    /**
     * 思维画像：基于当前登录用户返回个性化数据
     */
    @GetMapping("/profile")
    public Result<Map<String, Object>> profile(
            @org.springframework.web.bind.annotation.RequestParam(value = "locale", defaultValue = "en") String locale) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.success(arenaDataService.getProfile());
        }
        return Result.success(userProfileService.getOrCreateProfile(userId, locale));
    }

    /**
     * 保存/更新当前用户的辩论笔记（按 user_id + source 唯一）
     */
    @PostMapping("/notes")
    public Result<Map<String, Object>> saveNote(@RequestBody Map<String, Object> request) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        String sourceType = String.valueOf(request.getOrDefault("sourceType", "debate"));
        String sourceKey = String.valueOf(request.getOrDefault("sourceKey", ""));
        if (sourceKey.isEmpty()) {
            return Result.fail(400, "sourceKey 不能为空");
        }
        String topic = String.valueOf(request.getOrDefault("topic", ""));
        String content = String.valueOf(request.getOrDefault("content", ""));
        UserNoteEntity saved = userNoteService.saveOrUpdate(userId, sourceType, sourceKey, topic, content);
        Map<String, Object> body = new HashMap<>();
        body.put("id", saved.getId());
        body.put("content", saved.getContent());
        body.put("updatedAt", saved.getUpdatedAt());
        return Result.success(body);
    }

    /**
     * 读取当前用户在指定辩题下的笔记
     */
    @GetMapping("/notes")
    public Result<Map<String, Object>> getNote(
            @org.springframework.web.bind.annotation.RequestParam String sourceType,
            @org.springframework.web.bind.annotation.RequestParam String sourceKey) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        UserNoteEntity note = userNoteService.getNote(userId, sourceType, sourceKey);
        if (note == null) {
            return Result.success(Collections.emptyMap());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("id", note.getId());
        body.put("content", note.getContent());
        body.put("topic", note.getTopic());
        body.put("updatedAt", note.getUpdatedAt());
        return Result.success(body);
    }

    /**
     * 统一 Agent 调用入口（atlas/nova/forge/ledger/echo/sentinel）
     */
    @PostMapping("/agent/run")
    public Result<Map<String, Object>> runAgent(@RequestBody Map<String, Object> request) {
        String agent = String.valueOf(request.getOrDefault("agent", "echo"));
        String query = String.valueOf(request.getOrDefault("query", ""));
        @SuppressWarnings("unchecked")
        List<String> imageList = request.get("imageList") instanceof List
                ? (List<String>) request.get("imageList")
                : Collections.emptyList();
        return Result.success(bailianAgentService.runAgent(agent, query, imageList));
    }

    /**
     * 哲学辩题生成（默认走 echo agent）
     */
    /**
     * 学科辩论 AI 出题：返回与 catalog battles 相同结构（question / builderView / breakerView / judgeQuestions / reveal）
     */
    @PostMapping("/agent/discipline/battle")
    public Result<Map<String, Object>> disciplineBattle(@RequestBody Map<String, Object> request) {
        String categoryEn = String.valueOf(request.getOrDefault("categoryEn", "General"));
        String categoryZh = String.valueOf(request.getOrDefault("categoryZh", "全部"));
        Map<String, Object> agentOut = bailianAgentService.runEcho(
                ArenaEchoPrompts.disciplineBattle(categoryEn, categoryZh), false);
        String text = String.valueOf(agentOut.getOrDefault("text", ""));
        Map<String, Object> battle = DisciplineBattleParser.parse(text);
        if (battle == null) {
            String preview = text.length() > 280 ? text.substring(0, 280) + "..." : text;
            if (text.contains("role-mismatch") || text.contains("CA-Ledger-DATA")) {
                throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                        "百炼 echo 应用角色不匹配，无法生成学科辩论 JSON。请配置正确的 Echo 应用 ID。");
            }
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "模型未返回可用的学科辩论 JSON。响应预览：" + preview);
        }
        agentOut.put("battle", battle);
        return Result.success(agentOut);
    }

    @PostMapping("/agent/topic")
    public Result<Map<String, Object>> topic(@RequestBody Map<String, Object> request) {
        String philosopherName = String.valueOf(request.getOrDefault("philosopherName", "某位思想家"));
        String philosopherSchool = String.valueOf(request.getOrDefault("philosopherSchool", "哲学"));
        String keyIdeas = String.valueOf(request.getOrDefault("keyIdeas", ""));
        String locale = String.valueOf(request.getOrDefault("locale", "zh"));
        Map<String, Object> agentOut = bailianAgentService.runEcho(
                ArenaEchoPrompts.debateTopic(philosopherName, philosopherSchool, keyIdeas, locale), false);
        Map<String, Object> debateTopic = DebateTopicParser.parse(String.valueOf(agentOut.getOrDefault("text", "")));
        if (debateTopic != null) {
            agentOut.put("debateTopic", debateTopic);
        }
        return Result.success(agentOut);
    }

    /**
     * 圆桌开场（多个思想家）
     */
    @PostMapping("/agent/roundtable/openings")
    public Result<Map<String, Object>> roundtableOpenings(@RequestBody Map<String, Object> request) {
        String topic = String.valueOf(request.getOrDefault("topic", ""));
        String participantsJson = RoundtableRequestSupport.participantsJson(request);
        return Result.success(runRoundtableEchoWithRetry(
                () -> ArenaEchoPrompts.roundtableOpenings(topic, participantsJson),
                () -> ArenaEchoPrompts.roundtableOpenings(topic, participantsJson, true)));
    }

    /**
     * 圆桌回复（用户发言后）
     */
    @PostMapping("/agent/roundtable/reply")
    public Result<Map<String, Object>> roundtableReply(@RequestBody Map<String, Object> request) {
        String topic = String.valueOf(request.getOrDefault("topic", ""));
        String userInput = String.valueOf(request.getOrDefault("userInput", ""));
        String participantsJson = RoundtableRequestSupport.participantsJson(request);
        return Result.success(runRoundtableEchoWithRetry(
                () -> ArenaEchoPrompts.roundtableReply(topic, userInput, participantsJson),
                () -> ArenaEchoPrompts.roundtableReply(topic, userInput, participantsJson, true)));
    }

    private Map<String, Object> runRoundtableEchoWithRetry(
            java.util.function.Supplier<String> primary,
            java.util.function.Supplier<String> compactFallback) {
        try {
            return runRoundtableEcho(primary.get());
        } catch (HackAstoneBizException e) {
            if (RoundtableRequestSupport.isContentFilterMessage(e.getMessage())) {
                try {
                    return runRoundtableEcho(compactFallback.get());
                } catch (HackAstoneBizException retry) {
                    throw contentFilterUserException(retry);
                }
            }
            throw e;
        }
    }

    private HackAstoneBizException contentFilterUserException(HackAstoneBizException cause) {
        if (RoundtableRequestSupport.isContentFilterMessage(cause.getMessage())) {
            return new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "圆桌生成被内容安全策略拦截，请尝试更换辩题或减少参与哲学家后重试。");
        }
        return cause;
    }

    private Map<String, Object> runRoundtableEcho(String prompt) {
        Map<String, Object> agentOut = bailianAgentService.runEcho(prompt, false);
        String text = String.valueOf(agentOut.getOrDefault("text", ""));
        Map<String, Object> roundtableMessages = RoundtableMessagesParser.parse(text);
        if (roundtableMessages == null) {
            String preview = text.length() > 280 ? text.substring(0, 280) + "..." : text;
            if (text.contains("role-mismatch") || text.contains("CA-Ledger-DATA")) {
                throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                        "百炼 echo 应用角色不匹配，无法生成圆桌 JSON。请配置正确的 Echo 应用 ID。");
            }
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "模型未返回可用的圆桌双语 JSON。响应预览：" + preview);
        }
        agentOut.put("roundtableMessages", roundtableMessages);
        return agentOut;
    }

    /**
     * 道德困境：单轮讨论（哲学家回应 + Judge 追问），与 Web/iOS 客户端约定字段，服务端组装 prompt 后调用百炼 Echo。
     */
    @PostMapping("/agent/dilemma/turn")
    public Result<Map<String, Object>> dilemmaTurn(@RequestBody Map<String, Object> request) {
        String moralDilemmaTitle = String.valueOf(request.getOrDefault("moralDilemmaTitle", ""));
        String moralDilemmaEnglishTitle = String.valueOf(request.getOrDefault("moralDilemmaEnglishTitle", ""));
        String dilemmaQuestion = String.valueOf(request.getOrDefault("question", ""));
        String promptLead = String.valueOf(request.getOrDefault("promptLead", ""));
        String userStance = String.valueOf(request.getOrDefault("userStance", ""));
        String philosopherName = String.valueOf(request.getOrDefault("philosopherName", ""));
        String philosopherSchool = String.valueOf(request.getOrDefault("philosopherSchool", ""));
        String keyIdeas = String.valueOf(request.getOrDefault("keyIdeas", ""));
        String history = String.valueOf(request.getOrDefault("history", ""));

        return Result.success(runDilemmaTurnEcho(ArenaEchoPrompts.dilemmaTurn(
                moralDilemmaTitle, moralDilemmaEnglishTitle, dilemmaQuestion, promptLead, userStance,
                philosopherName, philosopherSchool, keyIdeas, history)));
    }

    /**
     * 道德困境：讨论结束后的总结，服务端组装 prompt 后调用百炼 Echo。
     */
    @PostMapping("/agent/dilemma/summary")
    public Result<Map<String, Object>> dilemmaSummary(@RequestBody Map<String, Object> request) {
        String moralDilemmaTitle = String.valueOf(request.getOrDefault("moralDilemmaTitle", ""));
        String dilemmaQuestion = String.valueOf(request.getOrDefault("question", ""));
        String userStance = String.valueOf(request.getOrDefault("userStance", ""));
        String philosopherName = String.valueOf(request.getOrDefault("philosopherName", ""));
        String philosopherSchool = String.valueOf(request.getOrDefault("philosopherSchool", ""));
        String history = String.valueOf(request.getOrDefault("history", ""));

        return Result.success(runDilemmaSummaryEcho(ArenaEchoPrompts.dilemmaSummary(
                moralDilemmaTitle, dilemmaQuestion, userStance, philosopherName, philosopherSchool, history)));
    }

    private Map<String, Object> runDilemmaTurnEcho(String prompt) {
        Map<String, Object> agentOut = bailianAgentService.runEcho(prompt, false);
        String text = String.valueOf(agentOut.getOrDefault("text", ""));
        Map<String, Object> dilemmaTurn = DilemmaAiParser.parseTurn(text);
        if (dilemmaTurn == null) {
            String preview = text.length() > 280 ? text.substring(0, 280) + "..." : text;
            if (text.contains("role-mismatch") || text.contains("CA-Ledger-DATA")) {
                throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                        "百炼 echo 应用角色不匹配，无法生成道德困境 JSON。请配置正确的 Echo 应用 ID。");
            }
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "模型未返回可用的道德困境双语 JSON。响应预览：" + preview);
        }
        agentOut.put("dilemmaTurn", dilemmaTurn);
        return agentOut;
    }

    private Map<String, Object> runDilemmaSummaryEcho(String prompt) {
        Map<String, Object> agentOut = bailianAgentService.runEcho(prompt, false);
        String text = String.valueOf(agentOut.getOrDefault("text", ""));
        Map<String, Object> dilemmaSummary = DilemmaAiParser.parseSummary(text);
        if (dilemmaSummary == null) {
            String preview = text.length() > 280 ? text.substring(0, 280) + "..." : text;
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "模型未返回可用的道德困境总结双语 JSON。响应预览：" + preview);
        }
        agentOut.put("dilemmaSummary", dilemmaSummary);
        return agentOut;
    }
}
