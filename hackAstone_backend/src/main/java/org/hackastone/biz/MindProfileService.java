package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hackastone.base.dal.entity.MindProfileEntity;
import org.hackastone.base.dal.mapper.MindProfileMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class MindProfileService {

    private static final String DEFAULT_USER_ID = "guest";
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.of("Asia/Shanghai"));

    @Autowired
    private DataSource dataSource;
    @Autowired
    private MindProfileMapper mindProfileMapper;
    @Autowired
    private ArenaDataService arenaDataService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private volatile boolean tableReady = false;

    public Map<String, Object> getOrCreateProfile(String userId) {
        String normalizedUserId = normalizeUserId(userId);
        try {
            ensureTableIfNeeded();
            MindProfileEntity entity = mindProfileMapper.selectByUserId(normalizedUserId);
            if (entity == null) {
                Map<String, Object> defaultProfile = newDefaultProfile(normalizedUserId, true);
                saveProfile(normalizedUserId, defaultProfile);
                return defaultProfile;
            }
            return toPayload(normalizedUserId, entity.getProfileJson(), entity.getUpdatedAt(), true);
        } catch (Exception e) {
            return newDefaultProfile(normalizedUserId, false);
        }
    }

    public Map<String, Object> saveProfile(String userId, Map<String, Object> rawProfile) {
        String normalizedUserId = normalizeUserId(userId);
        Map<String, Object> profile = new LinkedHashMap<>(rawProfile);
        profile.remove("userId");
        profile.remove("persisted");
        profile.remove("lastUpdatedAt");

        try {
            ensureTableIfNeeded();
            String profileJson = objectMapper.writeValueAsString(profile);
            mindProfileMapper.upsert(normalizedUserId, profileJson);
            MindProfileEntity saved = mindProfileMapper.selectByUserId(normalizedUserId);
            if (saved == null) {
                return newDefaultProfile(normalizedUserId, false);
            }
            return toPayload(normalizedUserId, saved.getProfileJson(), saved.getUpdatedAt(), true);
        } catch (Exception e) {
            Map<String, Object> fallback = new LinkedHashMap<>(profile);
            fallback.put("userId", normalizedUserId);
            fallback.put("persisted", false);
            fallback.put("storageMessage", "Database unavailable");
            return fallback;
        }
    }

    private synchronized void ensureTableIfNeeded() throws Exception {
        if (tableReady) {
            return;
        }
        String sql = "CREATE TABLE IF NOT EXISTS ha_mind_profile ("
                + "user_id VARCHAR(64) NOT NULL PRIMARY KEY,"
                + "profile_json MEDIUMTEXT NOT NULL,"
                + "created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + "updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User mind profile storage'";
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
        tableReady = true;
    }

    private Map<String, Object> newDefaultProfile(String userId, boolean persisted) {
        Map<String, Object> copied = objectMapper.convertValue(
                arenaDataService.getProfile(),
                new TypeReference<LinkedHashMap<String, Object>>() {}
        );
        copied.put("userId", userId);
        copied.put("persisted", persisted);
        copied.put("lastUpdatedAt", TIME_FORMAT.format(java.time.Instant.now()));
        return copied;
    }

    private Map<String, Object> toPayload(
            String userId,
            String profileJson,
            java.util.Date updatedAt,
            boolean persisted
    ) {
        try {
            Map<String, Object> profile = objectMapper.readValue(
                    profileJson,
                    new TypeReference<LinkedHashMap<String, Object>>() {}
            );
            profile.put("userId", userId);
            profile.put("persisted", persisted);
            if (updatedAt != null) {
                profile.put("lastUpdatedAt", TIME_FORMAT.format(updatedAt.toInstant()));
            }
            return profile;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse stored mind profile", e);
        }
    }

    private String normalizeUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return DEFAULT_USER_ID;
        }
        return userId.trim();
    }
}
