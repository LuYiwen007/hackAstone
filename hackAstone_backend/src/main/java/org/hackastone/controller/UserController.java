package org.hackastone.controller;

import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.auth.JwtUtil;
import org.hackastone.base.util.template.BizTemplate;
import org.hackastone.biz.UserBiz;
import org.hackastone.controller.model.UserLoginRequest;
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
            String token = JwtUtil.generateToken(user.getUserId(), user.getEmail() != null ? user.getEmail() : user.getUserId());
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("userId", user.getUserId());
            result.put("email", user.getEmail());
            result.put("nickname", user.getNickname());
            return result;
        });
    }
}
