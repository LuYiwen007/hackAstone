package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

@Service
public class BailianAgentService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    @Autowired
    private BailianAgentConfig config;

    public Map<String, Object> runAgent(String agentName, String query, List<String> imageList) {
        String appId = normalizeDashScopeAppIdPathSegment(resolveAppId(agentName));
        String cacheKey = appId + "::" + query;
        CacheEntry hit = cache.get(cacheKey);
        long now = System.currentTimeMillis();
        if (hit != null && now - hit.timestamp <= config.getCacheTtlMs()) {
            Map<String, Object> out = new HashMap<>(hit.data);
            out.put("cached", true);
            return out;
        }

        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> input = new HashMap<>();
        input.put("prompt", query);
        if (imageList != null && !imageList.isEmpty()) {
            input.put("image_list", imageList);
        }
        payload.put("input", input);
        payload.put("parameters", new HashMap<>());
        payload.put("debug", new HashMap<>());

        Map<String, Object> response = postJson(appId, payload);
        String text = extractText(response);

        Map<String, Object> out = new HashMap<>();
        out.put("agent", agentName);
        out.put("appId", appId);
        out.put("text", text);
        // 不把百炼完整 JSON 回传给前端：体积大且偶发导致响应序列化失败（HTTP 500）
        out.put("cached", false);
        cache.put(cacheKey, new CacheEntry(now, out));
        return out;
    }

    public Map<String, Object> runAtlas(String query) {
        return runAgent("atlas", query, Collections.emptyList());
    }

    public Map<String, Object> runEcho(String query) {
        return runAgent("echo", query, Collections.emptyList());
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

    /**
     * 百炼 URL 中的应用 ID 一般为 UUID；若配置为 32 位无连字符十六进制，规范为 8-4-4-4-12 再请求。
     */
    private static String normalizeDashScopeAppIdPathSegment(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        String compact = t.replace("-", "").toLowerCase(Locale.ROOT);
        if (compact.length() == 32 && compact.matches("[0-9a-f]{32}")) {
            return compact.substring(0, 8) + "-" + compact.substring(8, 12) + "-" + compact.substring(12, 16) + "-"
                    + compact.substring(16, 20) + "-" + compact.substring(20, 32);
        }
        return t;
    }

    private Map<String, Object> postJson(String appId, Map<String, Object> payload) {
        String apiKey = config.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(),
                    "缺少百炼 API Key：请在 application.yml 配置 bailian.api-key，或设置环境变量 DASHSCOPE_API_KEY / BAILIAN_API_KEY");
        }
        String endpoint = config.getEndpoint().replaceAll("/$", "") + "/" + appId + "/completion";
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
                throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(), detail);
            }
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
