package org.hackastone.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "bailian")
public class BailianAgentConfig {

    private String endpoint = "https://dashscope.aliyuncs.com/api/v1/apps";
    private String apiKey;
    private int timeoutMs = 7000;
    private int cacheTtlMs = 60000;

    private String atlasAppId;
    private String novaAppId;
    private String forgeAppId;
    private String ledgerAppId;
    private String echoAppId;
    private String sentinelAppId;

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(int timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    public int getCacheTtlMs() {
        return cacheTtlMs;
    }

    public void setCacheTtlMs(int cacheTtlMs) {
        this.cacheTtlMs = cacheTtlMs;
    }

    public String getAtlasAppId() {
        return atlasAppId;
    }

    public void setAtlasAppId(String atlasAppId) {
        this.atlasAppId = atlasAppId;
    }

    public String getNovaAppId() {
        return novaAppId;
    }

    public void setNovaAppId(String novaAppId) {
        this.novaAppId = novaAppId;
    }

    public String getForgeAppId() {
        return forgeAppId;
    }

    public void setForgeAppId(String forgeAppId) {
        this.forgeAppId = forgeAppId;
    }

    public String getLedgerAppId() {
        return ledgerAppId;
    }

    public void setLedgerAppId(String ledgerAppId) {
        this.ledgerAppId = ledgerAppId;
    }

    public String getEchoAppId() {
        return echoAppId;
    }

    public void setEchoAppId(String echoAppId) {
        this.echoAppId = echoAppId;
    }

    public String getSentinelAppId() {
        return sentinelAppId;
    }

    public void setSentinelAppId(String sentinelAppId) {
        this.sentinelAppId = sentinelAppId;
    }
}
