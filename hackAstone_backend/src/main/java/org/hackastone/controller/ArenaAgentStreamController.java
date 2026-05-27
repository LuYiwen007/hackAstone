package org.hackastone.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.hackastone.biz.ArenaEchoPrompts;
import org.hackastone.biz.BailianAgentService;
import org.hackastone.biz.BailianStreamHandler;
import org.hackastone.biz.DebateTopicParser;
import org.hackastone.biz.DilemmaAiParser;
import org.hackastone.biz.DisciplineBattleParser;
import org.hackastone.biz.DisciplineDebateParser;
import org.hackastone.biz.PhilosophyJudgeStepParser;
import org.hackastone.biz.RoundtableMessagesParser;
import org.hackastone.biz.RoundtableRequestSupport;
import org.hackastone.config.BailianAgentConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 大模型对话 SSE 流式接口（通义千问 DashScope 应用 completion + incremental_output）。
 * 事件格式：{@code {"type":"delta","text":"..."}} / {@code {"type":"done",...}} / {@code {"type":"error","message":"..."}}
 */
@RestController
@RequestMapping("/arena/agent")
public class ArenaAgentStreamController {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final ExecutorService STREAM_EXECUTOR = Executors.newCachedThreadPool();

    @Autowired
    private BailianAgentService bailianAgentService;
    @Autowired
    private BailianAgentConfig bailianAgentConfig;

    @PostMapping(value = "/run/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter runAgentStream(@RequestBody Map<String, Object> request) {
        String agent = String.valueOf(request.getOrDefault("agent", "echo"));
        String query = String.valueOf(request.getOrDefault("query", ""));
        @SuppressWarnings("unchecked")
        List<String> imageList = request.get("imageList") instanceof List
                ? (List<String>) request.get("imageList")
                : Collections.emptyList();
        return streamEchoLike(agent, query, imageList, null, false);
    }

    @PostMapping(value = "/topic/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter topicStream(@RequestBody Map<String, Object> request) {
        String philosopherName = String.valueOf(request.getOrDefault("philosopherName", "某位思想家"));
        String philosopherSchool = String.valueOf(request.getOrDefault("philosopherSchool", "哲学"));
        String keyIdeas = String.valueOf(request.getOrDefault("keyIdeas", ""));
        String prompt = ArenaEchoPrompts.debateTopic(philosopherName, philosopherSchool, keyIdeas);
        long timeout = bailianAgentConfig.getTimeoutMs() + 30_000L;
        SseEmitter emitter = new SseEmitter(timeout);
        STREAM_EXECUTOR.execute(() -> {
            try {
                String fullText = null;
                Map<String, Object> debateTopic = null;
                for (int attempt = 0; attempt < 2; attempt++) {
                    fullText = bailianAgentService.streamAgent("echo", prompt, Collections.emptyList(), deltaHandler(emitter));
                    debateTopic = DebateTopicParser.parse(fullText);
                    if (debateTopic != null) {
                        break;
                    }
                }
                if (debateTopic == null) {
                    throw new HackAstoneBizException(
                            org.hackastone.base.util.constants.ResultEnum.AI_SERVICE_ERROR.getCode(),
                            "模型未返回有效的辩题 JSON");
                }
                Map<String, Object> done = baseDone("echo", fullText, false);
                done.put("debateTopic", debateTopic);
                sendJson(emitter, done);
                emitter.complete();
            } catch (Exception e) {
                completeWithError(emitter, e);
            }
        });
        return emitter;
    }

    @PostMapping(value = "/discipline/battle/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter disciplineBattleStream(@RequestBody Map<String, Object> request) {
        String categoryEn = String.valueOf(request.getOrDefault("categoryEn", "General"));
        String categoryZh = String.valueOf(request.getOrDefault("categoryZh", "全部"));
        String prompt = ArenaEchoPrompts.disciplineBattle(categoryEn, categoryZh);
        return streamEchoLike("echo", prompt, Collections.emptyList(), (fullText, out) -> {
            Map<String, Object> battle = DisciplineBattleParser.parse(fullText);
            if (battle != null) {
                out.put("battle", battle);
            }
        }, false);
    }

    @PostMapping(value = "/discipline/debate/opponent/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter disciplineDebateOpponentStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.disciplineDebateOpponentReply(
                str(request, "question"),
                str(request, "builderView"),
                str(request, "breakerView"),
                str(request, "userChoice"),
                str(request, "userMessage"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), null, false);
    }

    @PostMapping(value = "/discipline/debate/dual/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter disciplineDebateDualStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.disciplineDebateDualReply(
                str(request, "question"),
                str(request, "builderView"),
                str(request, "breakerView"),
                str(request, "userMessage"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), (fullText, out) -> {
            Map<String, String> dual = DisciplineDebateParser.parseDualReply(fullText);
            if (dual != null) {
                out.put("disciplineDual", dual);
            }
        }, false);
    }

    @PostMapping(value = "/discipline/debate/summary/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter disciplineDebateSummaryStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.disciplineDebateSummary(
                str(request, "question"),
                str(request, "builderView"),
                str(request, "breakerView"),
                str(request, "userChoice"),
                str(request, "history"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), (fullText, out) -> {
            Map<String, Object> summary = DisciplineDebateParser.parseSummary(fullText);
            if (summary != null) {
                out.put("disciplineSummary", summary);
            }
        }, false);
    }

    @PostMapping(value = "/roundtable/openings/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter roundtableOpeningsStream(@RequestBody Map<String, Object> request) {
        String topic = String.valueOf(request.getOrDefault("topic", ""));
        String participantsJson = RoundtableRequestSupport.participantsJson(request);
        return streamRoundtableWithRetry(
                () -> ArenaEchoPrompts.roundtableOpenings(topic, participantsJson),
                () -> ArenaEchoPrompts.roundtableOpenings(topic, participantsJson, true));
    }

    @PostMapping(value = "/philosophy/philosopher/to-user/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter philosophyPhilosopherToUserStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.philosophyPhilosopherToUser(
                str(request, "debateQuestion"),
                str(request, "philosopherId"),
                str(request, "philosopherName"),
                str(request, "school"),
                str(request, "keyIdeas"),
                str(request, "summary"),
                str(request, "userStance"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), null, false);
    }

    @PostMapping(value = "/philosophy/philosopher/to-judge/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter philosophyPhilosopherToJudgeStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.philosophyPhilosopherToJudge(
                str(request, "debateQuestion"),
                str(request, "philosopherId"),
                str(request, "philosopherName"),
                str(request, "school"),
                str(request, "keyIdeas"),
                str(request, "summary"),
                str(request, "userStance"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), null, false);
    }

    @PostMapping(value = "/philosophy/judge/step/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter philosophyJudgeStepStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.philosophyJudgeStep(
                str(request, "debateQuestion"),
                str(request, "philosopherName"),
                str(request, "school"),
                str(request, "userStance"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), (fullText, out) -> {
            Map<String, Object> judge = PhilosophyJudgeStepParser.parse(fullText);
            if (judge != null) {
                out.put("philosophyJudge", judge);
            }
        }, false);
    }

    @PostMapping(value = "/roundtable/philosopher/opening/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter roundtablePhilosopherOpeningStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.roundtablePhilosopherOpening(
                str(request, "topic"),
                str(request, "philosopherId"),
                str(request, "philosopherName"),
                str(request, "school"),
                str(request, "keyIdeas"),
                str(request, "summary"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), null, false);
    }

    @PostMapping(value = "/roundtable/philosopher/reply/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter roundtablePhilosopherReplyStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.roundtablePhilosopherReply(
                str(request, "topic"),
                str(request, "userInput"),
                str(request, "philosopherId"),
                str(request, "philosopherName"),
                str(request, "school"),
                str(request, "keyIdeas"),
                str(request, "summary"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), null, false);
    }

    private static String str(Map<String, Object> request, String key) {
        Object v = request.get(key);
        return v == null ? "" : String.valueOf(v);
    }

    @PostMapping(value = "/roundtable/reply/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter roundtableReplyStream(@RequestBody Map<String, Object> request) {
        String topic = String.valueOf(request.getOrDefault("topic", ""));
        String userInput = String.valueOf(request.getOrDefault("userInput", ""));
        String participantsJson = RoundtableRequestSupport.participantsJson(request);
        return streamRoundtableWithRetry(
                () -> ArenaEchoPrompts.roundtableReply(topic, userInput, participantsJson),
                () -> ArenaEchoPrompts.roundtableReply(topic, userInput, participantsJson, true));
    }

    @PostMapping(value = "/dilemma/philosopher/to-user/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter dilemmaPhilosopherToUserStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.dilemmaPhilosopherToUser(
                str(request, "moralDilemmaTitle"),
                str(request, "moralDilemmaEnglishTitle"),
                str(request, "question"),
                str(request, "promptLead"),
                str(request, "userStance"),
                str(request, "philosopherId"),
                str(request, "philosopherName"),
                str(request, "philosopherSchool"),
                str(request, "keyIdeas"),
                str(request, "summary"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), null, false);
    }

    @PostMapping(value = "/dilemma/judge/step/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter dilemmaJudgeStepStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.dilemmaJudgeStep(
                str(request, "moralDilemmaTitle"),
                str(request, "moralDilemmaEnglishTitle"),
                str(request, "question"),
                str(request, "promptLead"),
                str(request, "userStance"),
                str(request, "philosopherName"),
                str(request, "philosopherSchool"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), (fullText, out) -> {
            Map<String, Object> judge = PhilosophyJudgeStepParser.parse(fullText);
            if (judge != null) {
                out.put("philosophyJudge", judge);
            }
        }, false);
    }

    @PostMapping(value = "/dilemma/philosopher/to-judge/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter dilemmaPhilosopherToJudgeStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.dilemmaPhilosopherToJudge(
                str(request, "moralDilemmaTitle"),
                str(request, "moralDilemmaEnglishTitle"),
                str(request, "question"),
                str(request, "promptLead"),
                str(request, "userStance"),
                str(request, "philosopherId"),
                str(request, "philosopherName"),
                str(request, "philosopherSchool"),
                str(request, "keyIdeas"),
                str(request, "summary"),
                str(request, "history"),
                str(request, "locale"));
        return streamEchoLike("echo", prompt, Collections.emptyList(), null, false);
    }

    /** @deprecated 合并双语 JSON 单轮；请用分步流式接口 */
    @PostMapping(value = "/dilemma/turn/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter dilemmaTurnStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.dilemmaTurn(
                String.valueOf(request.getOrDefault("moralDilemmaTitle", "")),
                String.valueOf(request.getOrDefault("moralDilemmaEnglishTitle", "")),
                String.valueOf(request.getOrDefault("question", "")),
                String.valueOf(request.getOrDefault("promptLead", "")),
                String.valueOf(request.getOrDefault("userStance", "")),
                String.valueOf(request.getOrDefault("philosopherName", "")),
                String.valueOf(request.getOrDefault("philosopherSchool", "")),
                String.valueOf(request.getOrDefault("keyIdeas", "")),
                String.valueOf(request.getOrDefault("history", "")));
        return streamEchoLike("echo", prompt, Collections.emptyList(), (fullText, out) -> {
            Map<String, Object> dilemmaTurn = DilemmaAiParser.parseTurn(fullText);
            if (dilemmaTurn != null) {
                out.put("dilemmaTurn", dilemmaTurn);
            }
        }, false);
    }

    @PostMapping(value = "/dilemma/summary/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter dilemmaSummaryStream(@RequestBody Map<String, Object> request) {
        String prompt = ArenaEchoPrompts.dilemmaSummary(
                String.valueOf(request.getOrDefault("moralDilemmaTitle", "")),
                String.valueOf(request.getOrDefault("question", "")),
                String.valueOf(request.getOrDefault("userStance", "")),
                String.valueOf(request.getOrDefault("philosopherName", "")),
                String.valueOf(request.getOrDefault("philosopherSchool", "")),
                String.valueOf(request.getOrDefault("history", "")));
        return streamEchoLike("echo", prompt, Collections.emptyList(), (fullText, out) -> {
            Map<String, Object> dilemmaSummary = DilemmaAiParser.parseSummary(fullText);
            if (dilemmaSummary != null) {
                out.put("dilemmaSummary", dilemmaSummary);
            }
        }, false);
    }

    private SseEmitter streamRoundtableWithRetry(
            java.util.function.Supplier<String> primary,
            java.util.function.Supplier<String> compactFallback) {
        return streamEchoLike("echo", primary.get(), Collections.emptyList(), (fullText, out) -> {
            Map<String, Object> roundtableMessages = RoundtableMessagesParser.parse(fullText);
            if (roundtableMessages != null) {
                out.put("roundtableMessages", roundtableMessages);
            }
        }, false, compactFallback);
    }

    private SseEmitter streamEchoLike(
            String agent,
            String query,
            List<String> imageList,
            DoneEnricher enricher,
            boolean useCacheFlag,
            java.util.function.Supplier<String> compactFallbackPrompt
    ) {
        long timeout = bailianAgentConfig.getTimeoutMs() + 30_000L;
        SseEmitter emitter = new SseEmitter(timeout);
        STREAM_EXECUTOR.execute(() -> {
            try {
                String fullText = streamWithOptionalRetry(agent, query, imageList, emitter, compactFallbackPrompt);
                Map<String, Object> done = baseDone(agent, fullText, useCacheFlag);
                if (enricher != null) {
                    enricher.enrich(fullText, done);
                }
                sendJson(emitter, done);
                emitter.complete();
            } catch (Exception e) {
                completeWithError(emitter, e);
            }
        });
        return emitter;
    }

    private String streamWithOptionalRetry(
            String agent,
            String query,
            List<String> imageList,
            SseEmitter emitter,
            java.util.function.Supplier<String> compactFallbackPrompt
    ) {
        try {
            return bailianAgentService.streamAgent(agent, query, imageList, deltaHandler(emitter));
        } catch (HackAstoneBizException e) {
            if (compactFallbackPrompt != null && RoundtableRequestSupport.isContentFilterMessage(e.getMessage())) {
                return bailianAgentService.streamAgent(agent, compactFallbackPrompt.get(), imageList, deltaHandler(emitter));
            }
            throw e;
        }
    }

    @FunctionalInterface
    private interface DoneEnricher {
        void enrich(String fullText, Map<String, Object> out) throws Exception;
    }

    private SseEmitter streamEchoLike(
            String agent,
            String query,
            List<String> imageList,
            DoneEnricher enricher,
            boolean useCacheFlag
    ) {
        return streamEchoLike(agent, query, imageList, enricher, useCacheFlag, null);
    }

    private BailianStreamHandler deltaHandler(SseEmitter emitter) {
        return (delta, accumulated) -> {
            try {
                Map<String, Object> ev = new HashMap<>();
                ev.put("type", "delta");
                ev.put("text", delta);
                ev.put("accumulated", accumulated);
                sendJson(emitter, ev);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        };
    }

    private static Map<String, Object> baseDone(String agent, String fullText, boolean cached) {
        Map<String, Object> done = new HashMap<>();
        done.put("type", "done");
        done.put("agent", agent);
        done.put("text", fullText);
        done.put("cached", cached);
        return done;
    }

    private static void sendJson(SseEmitter emitter, Map<String, Object> payload) throws IOException {
        emitter.send(SseEmitter.event().data(MAPPER.writeValueAsString(payload)));
    }

    private static void completeWithError(SseEmitter emitter, Exception e) {
        try {
            Map<String, Object> err = new HashMap<>();
            err.put("type", "error");
            String msg = e.getMessage();
            if (e instanceof HackAstoneBizException && ((HackAstoneBizException) e).getMessage() != null) {
                msg = ((HackAstoneBizException) e).getMessage();
            }
            err.put("message", msg != null ? msg : "流式请求失败");
            sendJson(emitter, err);
        } catch (IOException ignored) {
            // ignore
        }
        emitter.completeWithError(e);
    }
}
