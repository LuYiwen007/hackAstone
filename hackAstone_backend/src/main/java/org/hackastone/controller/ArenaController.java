package org.hackastone.controller;

import org.hackastone.base.util.Result;
import org.hackastone.biz.ArenaDataService;
import org.hackastone.biz.BailianAgentService;
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
    @GetMapping("/catalog")
    public Result<Map<String, Object>> catalog() {
        return Result.success(arenaDataService.getCatalog());
    }

    /**
     * 思维画像（当前为演示数据，后续可对齐用户与对局统计）
     */
    @GetMapping("/profile")
    public Result<Map<String, Object>> profile() {
        return Result.success(arenaDataService.getProfile());
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
    @PostMapping("/agent/topic")
    public Result<Map<String, Object>> topic(@RequestBody Map<String, Object> request) {
        String philosopherName = String.valueOf(request.getOrDefault("philosopherName", "某位思想家"));
        String philosopherSchool = String.valueOf(request.getOrDefault("philosopherSchool", "哲学"));
        String keyIdeas = String.valueOf(request.getOrDefault("keyIdeas", ""));
        String prompt = "[ROLE]\nCA-Echo-LLM\n\n[TASK]\n生成哲学辩论题目和双方观点，要求返回 JSON。\n\n"
                + "[REPO_CONTEXT]\nproject=hackAstone\n\n[TARGET_FILES]\nNONE\n\n[API_CONTRACT]\nNONE\n\n"
                + "[ACCEPTANCE_CRITERIA]\n返回字段 question/philosopherView/oppositeView/judgeQuestions/fullExplanation\n\n"
                + "[CONSTRAINTS]\n中文输出；judgeQuestions 至少3条；不要 markdown 包裹\n\n[RETURN_FORMAT]\njson\n\n"
                + "上下文：思想家=" + philosopherName + "；学派=" + philosopherSchool + "；关键思想=" + keyIdeas
                + "\n请仅返回 JSON 对象。";
        return Result.success(bailianAgentService.runEcho(prompt));
    }

    /**
     * 圆桌开场（多个思想家）
     */
    @PostMapping("/agent/roundtable/openings")
    public Result<Map<String, Object>> roundtableOpenings(@RequestBody Map<String, Object> request) {
        String topic = String.valueOf(request.getOrDefault("topic", ""));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> participants = request.get("participants") instanceof List
                ? (List<Map<String, Object>>) request.get("participants")
                : new ArrayList<>();
        String prompt = "[ROLE]\nCA-Echo-LLM\n\n[TASK]\n根据辩题给每位思想家生成一段开场发言，返回 JSON 数组。"
                + "\n\n[RETURN_FORMAT]\njson\n\n辩题：" + topic + "\n参与者：" + participants
                + "\n输出格式：{\"messages\":[{\"speaker\":\"philosopherId\",\"content\":\"...\"}]}\n仅返回 JSON。";
        return Result.success(bailianAgentService.runEcho(prompt));
    }

    /**
     * 圆桌回复（用户发言后）
     */
    @PostMapping("/agent/roundtable/reply")
    public Result<Map<String, Object>> roundtableReply(@RequestBody Map<String, Object> request) {
        String topic = String.valueOf(request.getOrDefault("topic", ""));
        String userInput = String.valueOf(request.getOrDefault("userInput", ""));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> participants = request.get("participants") instanceof List
                ? (List<Map<String, Object>>) request.get("participants")
                : new ArrayList<>();
        String prompt = "[ROLE]\nCA-Echo-LLM\n\n[TASK]\n用户在圆桌辩论中发言后，给每位思想家各生成一条回应，返回 JSON。"
                + "\n\n[RETURN_FORMAT]\njson\n\n辩题：" + topic + "\n用户发言：" + userInput + "\n参与者：" + participants
                + "\n输出格式：{\"messages\":[{\"speaker\":\"philosopherId\",\"content\":\"...\"}]}\n仅返回 JSON。";
        return Result.success(bailianAgentService.runEcho(prompt));
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

        String prompt = "[ROLE]\nCA-Echo-LLM\n\n"
                + "[TASK]\n围绕给定道德困境继续一轮哲学讨论：先以哲学家身份回应用户，再以 Judge 身份追问，并判断是否可以进入总结。\n\n"
                + "[REPO_CONTEXT]\nproject=hackAstone\n\n[TARGET_FILES]\nNONE\n\n[API_CONTRACT]\nNONE\n\n"
                + "[ACCEPTANCE_CRITERIA]\n返回 philosopherReply/judgeQuestion/continueDebate 三个字段\n\n"
                + "[CONSTRAINTS]\n中文输出；哲学家回应要体现其思想风格；仅返回 JSON；continueDebate 为布尔值\n\n"
                + "[RETURN_FORMAT]\njson\n\n"
                + "道德困境：" + moralDilemmaTitle + " (" + moralDilemmaEnglishTitle + ")\n"
                + "问题：" + dilemmaQuestion + "\n"
                + "用户立场：" + userStance + "\n"
                + "哲学家：" + philosopherName + "；学派：" + philosopherSchool + "；关键思想：" + keyIdeas + "\n"
                + "讨论提醒：" + promptLead + "\n"
                + "历史：\n"
                + history;
        return Result.success(bailianAgentService.runEcho(prompt));
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

        String prompt = "[ROLE]\nCA-Echo-LLM\n\n"
                + "[TASK]\n根据道德困境讨论历史生成一份完整总结，解释用户立场与哲学家回应的张力。\n\n"
                + "[REPO_CONTEXT]\nproject=hackAstone\n\n[TARGET_FILES]\nNONE\n\n[API_CONTRACT]\nNONE\n\n"
                + "[ACCEPTANCE_CRITERIA]\n返回 fullExplanation 字段\n\n"
                + "[CONSTRAINTS]\n中文输出；条理清晰；保留哲学家风格；仅返回 JSON\n\n"
                + "[RETURN_FORMAT]\njson\n\n"
                + "道德困境：" + moralDilemmaTitle + "\n"
                + "问题：" + dilemmaQuestion + "\n"
                + "用户立场：" + userStance + "\n"
                + "哲学家：" + philosopherName + "；学派：" + philosopherSchool + "\n"
                + "历史：\n"
                + history;
        return Result.success(bailianAgentService.runEcho(prompt));
    }
}
