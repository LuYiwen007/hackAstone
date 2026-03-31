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
import java.net.HttpURLConnection;
import java.net.URL;
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
        String appId = resolveAppId(agentName);
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
        out.put("raw", response);
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

    private Map<String, Object> postJson(String appId, Map<String, Object> payload) {
        String apiKey = config.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "缺少配置: DASHSCOPE_API_KEY");
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

            byte[] data = OBJECT_MAPPER.writeValueAsBytes(payload);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(data);
            }

            int code = conn.getResponseCode();
            InputStream stream = code >= 200 && code < 300 ? conn.getInputStream() : conn.getErrorStream();
            String body = readAll(stream);
            if (code < 200 || code >= 300) {
                throw new HackAstoneBizException(ResultEnum.AI_SERVICE_ERROR.getCode(),
                        "百炼调用失败(" + code + "): " + body);
            }
            return OBJECT_MAPPER.readValue(body, new TypeReference<Map<String, Object>>() {});
        } catch (HackAstoneBizException e) {
            throw e;
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
