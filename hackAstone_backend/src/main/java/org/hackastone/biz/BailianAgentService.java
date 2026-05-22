package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.hackastone.base.util.constants.ResultEnum;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.hackastone.config.BailianAgentConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class BailianAgentService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    @Autowired
    private BailianAgentConfig config;

    private Map<String, Object> runAgent(String agentName, String query, List<String> imageList, boolean useCache) {
        String appId = resolveAppId(agentName);
        String cacheKey = appId + "::" + query;
        CacheEntry hit = useCache ? cache.get(cacheKey) : null;
        long now = System.currentTimeMillis();
        if (useCache && hit != null && now - hit.timestamp <= config.getCacheTtlMs()) {
            Map<String, Object> out = new HashMap<>(hit.data);
            out.put("cached", true);
            return out;
        }

        Map<String, Object> payload = buildPayload(query, imageList);
        @SuppressWarnings("unchecked")
        Map<String, Object> parameters = (Map<String, Object>) payload.get("parameters");
        if (parameters != null) {
            parameters.remove("incremental_output");
        }

        log.info("百炼 runAgent 请求 agent={} appIdSuffix={} promptLen={}",
                agentName, appIdSuffix(appId), query == null ? 0 : query.length());

        Map<String, Object> response = postJson(appId, payload, agentName);
        String text = extractText(response);
        assertAgentRoleCompatible(agentName, text);

        try {
            log.info("百炼 runAgent 完整响应 JSON（DashScope 原始 body 解析结果）: {}",
                    OBJECT_MAPPER.writeValueAsString(response));
        } catch (Exception e) {
            log.info("百炼 runAgent 完整响应 JSON（序列化失败）: {}", response);
        }
        log.info("百炼 runAgent 提取 text 长度={} 预览={}", text.length(), preview(text, 200));

        Map<String, Object> out = new HashMap<>();
        out.put("agent", agentName);
        out.put("appId", appId);
        out.put("text", text);
        // 不把百炼完整 JSON 回传给前端：体积大且偶发导致响应序列化失败（HTTP 500）
        out.put("cached", false);
        if (useCache) {
            cache.put(cacheKey, new CacheEntry(now, out));
        }
        return out;
    }

    public Map<String, Object> runAtlas(String query) {
        return runAgent("atlas", query, Collections.emptyList());
    }

    public Map<String, Object> runEcho(String query) {
        return runEcho(query, true);
    }

    /** @param useCache false 用于学科 AI 出题等需每次重新生成的场景 */
    public Map<String, Object> runEcho(String query, boolean useCache) {
        return runAgent("echo", query, Collections.emptyList(), useCache);
    }

    /**
     * 通义千问应用流式调用（官方：Header {@code X-DashScope-SSE: enable}，parameters.incremental_output=true）。
     *
     * @return 完整拼接后的 text
     */
    public String streamAgent(String agentName, String query, List<String> imageList, BailianStreamHandler handler) {
        String appId = resolveAppId(agentName);
        Map<String, Object> payload = buildPayload(query, imageList);
        log.info("百炼 streamAgent 请求 agent={} appIdSuffix={} promptLen={}",
                agentName, appIdSuffix(appId), query == null ? 0 : query.length());
        String fullText = streamPostJson(appId, payload, agentName, handler);
        assertAgentRoleCompatible(agentName, fullText);
        log.info("百炼 streamAgent 完成 agent={} textLen={} 预览={}", agentName, fullText.length(), preview(fullText, 200));
        return fullText;
    }

    public String streamEcho(String query, BailianStreamHandler handler) {
        return streamAgent("echo", query, Collections.emptyList(), handler);
    }

    public Map<String, Object> runAgent(String agentName, String query, List<String> imageList) {
        return runAgent(agentName, query, imageList, true);
    }

    private static Map<String, Object> buildPayload(String query, List<String> imageList) {
        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> input = new HashMap<>();
        input.put("prompt", query);
        if (imageList != null && !imageList.isEmpty()) {
            input.put("image_list", imageList);
        }
        payload.put("input", input);
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("incremental_output", true);
        payload.put("parameters", parameters);
        payload.put("debug", new HashMap<>());
        return payload;
    }

    private String resolveAppId(String agentName) {
        String key = agentName == null ? "" : agentName.trim().toLowerCase(Locale.ROOT);
        switch (key) {
            case "atlas":
                return require(config.getAtlasAppId(), "atlasAppId");
            case "nova":
                return require(config.getNovaAppId(), "novaAppId");
            case "forge":
                return require(config.getForgeAppId(), "forgeAppId");
            case "ledger":
                return require(config.getLedgerAppId(), "ledgerAppId");
            case "echo":
                return require(config.getEchoAppId(), "echoAppId");
            case "sentinel":
                return require(config.getSentinelAppId(), "sentinelAppId");
            default:
                throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "未知 agent: " + agentName);
        }
    }

    private String require(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "缺少配置: bailian." + fieldName);
        }
        return value.trim();
    }

    private static String appIdSuffix(String appId) {
        if (appId == null || appId.length() < 4) {
            return appId == null ? "" : appId;
        }
        return appId.substring(appId.length() - 4);
    }

    private static String preview(String s, int max) {
        if (s == null) {
            return "";
        }
        String oneLine = s.replace('\n', ' ').replace('\r', ' ');
        return oneLine.length() <= max ? oneLine : oneLine.substring(0, max) + "...";
    }

    /** 百炼应用内置角色与请求 [ROLE] 不一致时，HTTP 仍可能 200，但 text 不是业务所需 JSON */
    private void assertAgentRoleCompatible(String agentName, String text) {
        if (text == null || text.isEmpty()) {
            return;
        }
        if ("echo".equalsIgnoreCase(agentName)
                && (text.contains("role-mismatch") || text.contains("CA-Ledger-DATA"))) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "百炼 echo 应用角色不匹配：当前 bailian.echo-app-id 对应的是 Ledger（数据治理）应用，"
                            + "无法执行哲学辩题（CA-Echo-LLM）。请在 hackAstone 子空间内创建/选用 Echo 类应用，"
                            + "并将其 APP_ID 填入 bailian.echo-app-id。");
        }
    }

    private String streamPostJson(String appId, Map<String, Object> payload, String agentName, BailianStreamHandler handler) {
        String apiKey = config.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(),
                    "缺少百炼 API Key：请在 application.yml 配置 bailian.api-key，或设置环境变量 DASHSCOPE_API_KEY / BAILIAN_API_KEY");
        }
        String endpoint = config.getEndpoint().replaceAll("/$", "") + "/" + appId + "/completion";
        log.info("百炼 流式请求 agent={} POST {}", agentName, endpoint);
        HttpURLConnection conn = null;
        StringBuilder accumulated = new StringBuilder();
        try {
            URL url = new URL(endpoint);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(config.getTimeoutMs());
            conn.setReadTimeout(config.getTimeoutMs());
            conn.setDoOutput(true);
            conn.setRequestProperty("Authorization", "Bearer " + apiKey.trim());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "text/event-stream");
            conn.setRequestProperty("X-DashScope-SSE", "enable");
            String workspaceId = config.getWorkspaceId();
            if (workspaceId != null && !workspaceId.trim().isEmpty()) {
                conn.setRequestProperty("X-DashScope-WorkSpace", workspaceId.trim());
            }

            byte[] data = OBJECT_MAPPER.writeValueAsBytes(payload);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(data);
            }

            int code = conn.getResponseCode();
            InputStream stream = code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream();
            if (code < 200 || code >= 300) {
                String body = readAll(stream);
                throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                        "百炼流式调用失败(" + code + "): " + body);
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data:")) {
                        continue;
                    }
                    String json = line.substring(5).trim();
                    if (json.isEmpty() || "[DONE]".equals(json)) {
                        continue;
                    }
                    Map<String, Object> chunk = OBJECT_MAPPER.readValue(json, new TypeReference<Map<String, Object>>() {});
                    Object errCode = chunk.get("code");
                    if (errCode != null && !"".equals(String.valueOf(errCode).trim())) {
                        Object msg = chunk.get("message");
                        throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                                "百炼流式错误: " + (msg != null ? msg : chunk));
                    }
                    String delta = extractStreamTextDelta(chunk);
                    if (delta.isEmpty()) {
                        continue;
                    }
                    accumulated.append(delta);
                    if (handler != null) {
                        handler.onDelta(delta, accumulated.toString());
                    }
                }
            }
            return trimTrailingDashScopeMetadata(accumulated.toString());
        } catch (HackAstoneBizException e) {
            throw e;
        } catch (SocketTimeoutException e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "连接百炼超时（当前 timeout-ms=" + config.getTimeoutMs()
                            + "）。请增大 bailian.timeout-ms，或检查本机到 dashscope.aliyuncs.com 的网络。");
        } catch (ConnectException e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "无法连上百炼服务器（连接被拒绝）。请检查网络、代理、防火墙；若应用部署在海外，可尝试将 bailian.endpoint 改为国际版：https://dashscope-intl.aliyuncs.com/api/v1/apps");
        } catch (UnknownHostException e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "无法解析百炼域名（DNS 失败）。请检查网络或 DNS；海外环境可尝试国际版 endpoint，见 bailian.endpoint 配置说明。");
        } catch (Exception e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(), "百炼流式调用异常: " + e.getMessage());
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private Map<String, Object> postJson(String appId, Map<String, Object> payload, String agentName) {
        String apiKey = config.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(),
                    "缺少百炼 API Key：请在 application.yml 配置 bailian.api-key，或设置环境变量 DASHSCOPE_API_KEY / BAILIAN_API_KEY");
        }
        String endpoint = config.getEndpoint().replaceAll("/$", "") + "/" + appId + "/completion";
        log.info("百炼 请求 agent={} POST {}", agentName, endpoint);
        HttpURLConnection conn = null;
        try {
            URL url = new URL(endpoint);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(config.getTimeoutMs());
            conn.setReadTimeout(config.getTimeoutMs());
            conn.setDoOutput(true);
            conn.setRequestProperty("Authorization", "Bearer " + apiKey.trim());
            conn.setRequestProperty("Content-Type", "application/json");
            String workspaceId = config.getWorkspaceId();
            if (workspaceId != null && !workspaceId.trim().isEmpty()) {
                conn.setRequestProperty("X-DashScope-WorkSpace", workspaceId.trim());
            }

            byte[] data = OBJECT_MAPPER.writeValueAsBytes(payload);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(data);
            }

            int code = conn.getResponseCode();
            InputStream stream = code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream();
            String body = readAll(stream);
            if (code < 200 || code >= 300) {
                String detail = "百炼调用失败(" + code + "): " + body;
                if (body != null && body.contains("AppId") && body.contains("InvalidParameter")) {
                    detail += "。请确认 echo 应用 ID 与 API Key 同账号且国内/国际 endpoint 一致。若应用在百炼「子业务空间」下，还须配置 bailian.workspace-id 或 BAILIAN_WORKSPACE_ID（请求头 X-DashScope-WorkSpace）。GET /api/arena/llm/diagnostics 可查看 workspace 是否已配置。";
                } else if (body != null && (body.contains("App.AccessDenied") || body.contains("App access denied"))) {
                    detail += "。表示当前 API Key 无法在已配置的子业务空间（请求头 X-DashScope-WorkSpace）下访问该应用：请到百炼控制台进入**同一子业务空间**，新建或打开属于该空间的应用，将其 APP_ID 填入 bailian.echo-app-id（或 BAILIAN_ECHO_APP_ID）；不要使用其它空间或账号下的应用 ID。若你的应用建在默认主空间，可清空 bailian.workspace-id / BAILIAN_WORKSPACE_ID 后重试。";
                } else if (body != null && body.contains("InternalError")) {
                    detail += "。此为百炼服务端内部错误：可稍后重试；或在百炼控制台查看该应用/调用的监控与日志。请保存 JSON 中的 request_id 便于向阿里云工单或技术支持反馈。";
                }
                log.warn("百炼 响应(失败) HTTP {} agent={} 响应体(完整)={}", code, agentName, body);
                throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(), detail);
            }
            log.info("百炼 响应(成功) HTTP {} agent={} 响应体(完整)={}", code, agentName, body);
            return OBJECT_MAPPER.readValue(body, new TypeReference<Map<String, Object>>() {});
        } catch (HackAstoneBizException e) {
            throw e;
        } catch (SocketTimeoutException e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "连接百炼超时（当前 timeout-ms=" + config.getTimeoutMs()
                            + "）。请增大 bailian.timeout-ms，或检查本机到 dashscope.aliyuncs.com 的网络。");
        } catch (ConnectException e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "无法连上百炼服务器（连接被拒绝）。请检查网络、代理、防火墙；若应用部署在海外，可尝试将 bailian.endpoint 改为国际版：https://dashscope-intl.aliyuncs.com/api/v1/apps");
        } catch (UnknownHostException e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                    "无法解析百炼域名（DNS 失败）。请检查网络或 DNS；海外环境可尝试国际版 endpoint，见 bailian.endpoint 配置说明。");
        } catch (Exception e) {
            throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(), "百炼调用异常: " + e.getMessage());
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    /**
     * 流式 SSE 分片：仅提取 output.text 增量，忽略 finish_reason / usage 等尾包（勿序列化整段 chunk）。
     */
    @SuppressWarnings("unchecked")
    private String extractStreamTextDelta(Map<String, Object> chunk) {
        Object outputObj = chunk.get("output");
        if (!(outputObj instanceof Map)) {
            return "";
        }
        Map<String, Object> output = (Map<String, Object>) outputObj;
        Object text = output.get("text");
        if (text != null) {
            String s = String.valueOf(text);
            if (!isDashScopeStreamControlPayload(s)) {
                return s;
            }
        }
        Object contents = output.get("contents");
        if (contents instanceof List && !((List<?>) contents).isEmpty()) {
            Object first = ((List<?>) contents).get(0);
            if (first instanceof Map && ((Map<?, ?>) first).get("text") != null) {
                return String.valueOf(((Map<?, ?>) first).get("text"));
            }
        }
        return "";
    }

    /** 百炼流式尾包：text 字段可能是 finish_reason / usage 等控制 JSON，非模型正文 */
    private static boolean isDashScopeStreamControlPayload(String s) {
        if (s == null || s.isBlank()) {
            return false;
        }
        String t = s.trim();
        if (!t.startsWith("{")) {
            return false;
        }
        return t.contains("\"finish_reason\"") || t.contains("\"request_id\"");
    }

    /** 去掉流式尾包误拼接的 {@code {"output":{...finish_reason...}}} 元数据 */
    private static String trimTrailingDashScopeMetadata(String fullText) {
        if (fullText == null || fullText.isEmpty()) {
            return "";
        }
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

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        Object outputObj = response.get("output");
        if (outputObj instanceof Map) {
            Map<String, Object> output = (Map<String, Object>) outputObj;
            Object text = output.get("text");
            if (text != null) {
                return String.valueOf(text);
            }
            Object contents = output.get("contents");
            if (contents instanceof List && !((List<?>) contents).isEmpty()) {
                Object first = ((List<?>) contents).get(0);
                if (first instanceof Map && ((Map<?, ?>) first).get("text") != null) {
                    return String.valueOf(((Map<?, ?>) first).get("text"));
                }
            }
        }
        return OBJECT_MAPPER.valueToTree(response).toString();
    }

    private String readAll(InputStream inputStream) throws Exception {
        if (inputStream == null) {
            return "";
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    private static class CacheEntry {
        private final long timestamp;
        private final Map<String, Object> data;

        private CacheEntry(long timestamp, Map<String, Object> data) {
            this.timestamp = timestamp;
            this.data = data;
        }
    }
}
