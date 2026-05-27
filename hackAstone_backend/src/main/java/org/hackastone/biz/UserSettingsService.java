package org.hackastone.biz;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.dal.mapper.UserMapper;
import org.hackastone.controller.model.UserSettingsPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class UserSettingsService {

    private static final String SETTINGS_KEY = "settings";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserMapper userMapper;

    public UserSettingsPayload defaults() {
        UserSettingsPayload s = new UserSettingsPayload();
        s.setLocale("en");
        UserSettingsPayload.Preferences p = new UserSettingsPayload.Preferences();
        p.setAutoSave(true);
        p.setSound(false);
        p.setTimer(true);
        p.setCompact(false);
        p.setAnimations(true);
        s.setPreferences(p);
        UserSettingsPayload.Notifications n = new UserSettingsPayload.Notifications();
        n.setDaily(true);
        n.setWeekly(false);
        n.setUpdates(true);
        s.setNotifications(n);
        UserSettingsPayload.Appearance a = new UserSettingsPayload.Appearance();
        a.setTheme("dark");
        s.setAppearance(a);
        return s;
    }

    public UserSettingsPayload read(UserEntity user) {
        UserSettingsPayload defaults = defaults();
        if (user == null || !StringUtils.hasText(user.getExtInfo())) {
            return defaults;
        }
        try {
            Map<String, Object> root = objectMapper.readValue(
                    user.getExtInfo(), new TypeReference<Map<String, Object>>() {});
            Object raw = root.get(SETTINGS_KEY);
            if (raw == null) {
                return defaults;
            }
            UserSettingsPayload stored = objectMapper.convertValue(raw, UserSettingsPayload.class);
            return merge(defaults, stored);
        } catch (Exception e) {
            return defaults;
        }
    }

    public UserSettingsPayload update(String userId, UserSettingsPayload patch) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            throw new IllegalStateException("user not found");
        }
        UserSettingsPayload merged = merge(read(user), patch);
        try {
            Map<String, Object> root = new LinkedHashMap<>();
            if (StringUtils.hasText(user.getExtInfo())) {
                root = objectMapper.readValue(user.getExtInfo(), new TypeReference<Map<String, Object>>() {});
            }
            root.put(SETTINGS_KEY, objectMapper.convertValue(merged, new TypeReference<Map<String, Object>>() {}));
            userMapper.updateExtInfo(userId, objectMapper.writeValueAsString(root));
        } catch (Exception e) {
            throw new IllegalStateException("保存设置失败", e);
        }
        return merged;
    }

    private UserSettingsPayload merge(UserSettingsPayload base, UserSettingsPayload patch) {
        if (patch == null) {
            return base;
        }
        UserSettingsPayload out = defaults();
        out.setLocale(StringUtils.hasText(patch.getLocale()) ? patch.getLocale() : base.getLocale());

        UserSettingsPayload.Preferences bp = base.getPreferences() != null ? base.getPreferences() : defaults().getPreferences();
        UserSettingsPayload.Preferences pp = patch.getPreferences();
        UserSettingsPayload.Preferences op = new UserSettingsPayload.Preferences();
        op.setAutoSave(pp != null && pp.getAutoSave() != null ? pp.getAutoSave() : bp.getAutoSave());
        op.setSound(pp != null && pp.getSound() != null ? pp.getSound() : bp.getSound());
        op.setTimer(pp != null && pp.getTimer() != null ? pp.getTimer() : bp.getTimer());
        op.setCompact(pp != null && pp.getCompact() != null ? pp.getCompact() : bp.getCompact());
        op.setAnimations(pp != null && pp.getAnimations() != null ? pp.getAnimations() : bp.getAnimations());
        out.setPreferences(op);

        UserSettingsPayload.Notifications bn = base.getNotifications() != null ? base.getNotifications() : defaults().getNotifications();
        UserSettingsPayload.Notifications pn = patch.getNotifications();
        UserSettingsPayload.Notifications on = new UserSettingsPayload.Notifications();
        on.setDaily(pn != null && pn.getDaily() != null ? pn.getDaily() : bn.getDaily());
        on.setWeekly(pn != null && pn.getWeekly() != null ? pn.getWeekly() : bn.getWeekly());
        on.setUpdates(pn != null && pn.getUpdates() != null ? pn.getUpdates() : bn.getUpdates());
        out.setNotifications(on);

        UserSettingsPayload.Appearance ba = base.getAppearance() != null ? base.getAppearance() : defaults().getAppearance();
        UserSettingsPayload.Appearance pa = patch.getAppearance();
        UserSettingsPayload.Appearance oa = new UserSettingsPayload.Appearance();
        String theme = pa != null && StringUtils.hasText(pa.getTheme()) ? pa.getTheme() : ba.getTheme();
        if (!isValidTheme(theme)) {
            theme = "dark";
        }
        oa.setTheme(theme);
        out.setAppearance(oa);
        return out;
    }

    private static boolean isValidTheme(String theme) {
        return "dark".equals(theme) || "darker".equals(theme) || "midnight".equals(theme);
    }
}
