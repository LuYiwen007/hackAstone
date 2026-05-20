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
    public Result<String> register(@RequestBody UserRegisterRequest request) {
        return bizTemplate.execute(() -> userBiz.register(request.getUsername(), request.getPassword(), request.getNickname()));
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody UserLoginRequest request) {
        return bizTemplate.execute(() -> {
            UserEntity user = userBiz.login(request.getUsername(), request.getPassword());
            String token = JwtUtil.generateToken(user.getUserId(), user.getUsername());
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("userId", user.getUserId());
            result.put("username", user.getUsername());
            result.put("nickname", user.getNickname());
            return result;
        });
    }
}
