package org.hackastone.controller;

import org.hackastone.base.util.Result;
import org.hackastone.biz.ArenaDataService;
import org.hackastone.biz.BailianAgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/arena")
@CrossOrigin(origins = {"http://localhost:8081", "http://127.0.0.1:8081"})
public class ArenaController {

    @Autowired
    private ArenaDataService arenaDataService;
    @Autowired
    private BailianAgentService bailianAgentService;

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
