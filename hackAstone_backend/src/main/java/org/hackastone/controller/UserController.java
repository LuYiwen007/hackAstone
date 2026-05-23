package org.hackastone.controller;

import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.auth.JwtUtil;
import org.hackastone.base.util.auth.UserContext;
import org.hackastone.base.util.template.BizTemplate;
import org.hackastone.biz.UserBiz;
import org.hackastone.biz.UserSettingsService;
import org.hackastone.controller.model.UserChangePasswordRequest;
import org.hackastone.controller.model.UserLoginRequest;
import org.hackastone.controller.model.UserProfileUpdateRequest;
import org.hackastone.controller.model.UserRegisterRequest;
import org.hackastone.controller.model.UserSettingsPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserBiz userBiz;

    @Autowired
    private BizTemplate bizTemplate;

    @Autowired
    private UserSettingsService userSettingsService;

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody UserRegisterRequest request) {
        return bizTemplate.execute(() -> {
            String userId = userBiz.register(request.getEmail(), request.getPassword(), request.getNickname());
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            return body;
        });
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody UserLoginRequest request) {
        return bizTemplate.execute(() -> {
            UserEntity user = userBiz.login(request.getAccount(), request.getPassword());
            return toSessionMap(user);
        });
    }

    @GetMapping("/me")
    public Result<Map<String, Object>> me() {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        return bizTemplate.execute(() -> toMeMap(userBiz.getCurrentUser(userId)));
    }

    @PutMapping("/settings")
    public Result<Map<String, Object>> updateSettings(@RequestBody UserSettingsPayload request) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        return bizTemplate.execute(() -> {
            UserSettingsPayload saved = userBiz.updateSettings(userId, request);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("settings", settingsToMap(saved));
            return body;
        });
    }

    @PostMapping("/avatar")
    public Result<Map<String, Object>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        return bizTemplate.execute(() -> toMeMap(userBiz.updateAvatar(userId, file)));
    }

    @PutMapping("/profile")
    public Result<Map<String, Object>> updateProfile(@RequestBody UserProfileUpdateRequest request) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        return bizTemplate.execute(() -> toMeMap(userBiz.updateNickname(userId, request.getNickname())));
    }

    @PutMapping("/password")
    public Result<String> changePassword(@RequestBody UserChangePasswordRequest request) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        return bizTemplate.execute(() -> {
            userBiz.changePassword(userId, request.getOldPassword(), request.getNewPassword());
            return "ok";
        });
    }

    private Map<String, Object> toMeMap(UserEntity user) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("userId", user.getUserId());
        m.put("email", user.getEmail());
        m.put("nickname", user.getNickname());
        m.put("avatarUrl", user.getAvatarUrl());
        m.put("settings", settingsToMap(userSettingsService.read(user)));
        return m;
    }

    private static Map<String, Object> toSessionMap(UserEntity user) {
        String token = JwtUtil.generateToken(user.getUserId(), user.getEmail() != null ? user.getEmail() : user.getUserId());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getUserId());
        result.put("email", user.getEmail());
        result.put("nickname", user.getNickname());
        result.put("avatarUrl", user.getAvatarUrl());
        return result;
    }

    private static Map<String, Object> settingsToMap(UserSettingsPayload s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("locale", s.getLocale());
        if (s.getPreferences() != null) {
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("autoSave", s.getPreferences().getAutoSave());
            p.put("sound", s.getPreferences().getSound());
            p.put("timer", s.getPreferences().getTimer());
            p.put("compact", s.getPreferences().getCompact());
            p.put("animations", s.getPreferences().getAnimations());
            m.put("preferences", p);
        }
        if (s.getNotifications() != null) {
            Map<String, Object> n = new LinkedHashMap<>();
            n.put("daily", s.getNotifications().getDaily());
            n.put("weekly", s.getNotifications().getWeekly());
            n.put("updates", s.getNotifications().getUpdates());
            m.put("notifications", n);
        }
        if (s.getAppearance() != null) {
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("theme", s.getAppearance().getTheme());
            m.put("appearance", a);
        }
        return m;
    }
}
