package org.hackastone.controller;

import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.auth.JwtUtil;
import org.hackastone.base.util.auth.UserContext;
import org.hackastone.base.util.template.BizTemplate;
import org.hackastone.biz.UserBiz;
import org.hackastone.controller.model.UserChangePasswordRequest;
import org.hackastone.controller.model.UserLoginRequest;
import org.hackastone.controller.model.UserProfileUpdateRequest;
import org.hackastone.controller.model.UserRegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserBiz userBiz;

    @Autowired
    private BizTemplate bizTemplate;

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
        return bizTemplate.execute(() -> toProfileMap(userBiz.getCurrentUser(userId)));
    }

    @PutMapping("/profile")
    public Result<Map<String, Object>> updateProfile(@RequestBody UserProfileUpdateRequest request) {
        String userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return Result.fail(401, "未登录");
        }
        return bizTemplate.execute(() -> toProfileMap(userBiz.updateNickname(userId, request.getNickname())));
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

    private static Map<String, Object> toSessionMap(UserEntity user) {
        String token = JwtUtil.generateToken(user.getUserId(), user.getEmail() != null ? user.getEmail() : user.getUserId());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.putAll(toProfileMap(user));
        return result;
    }

    private static Map<String, Object> toProfileMap(UserEntity user) {
        Map<String, Object> m = new HashMap<>();
        m.put("userId", user.getUserId());
        m.put("email", user.getEmail());
        m.put("nickname", user.getNickname());
        m.put("avatarUrl", user.getAvatarUrl());
        return m;
    }
}
