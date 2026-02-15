package org.hackastone.controller;

import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.util.Result;
import org.hackastone.base.util.template.BizTemplate;
import org.hackastone.biz.UserBiz;
import org.hackastone.controller.model.UserLoginRequest;
import org.hackastone.controller.model.UserRegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user") // 所有接口都以 /user 开头
public class UserController {

    @Autowired
    private UserBiz userBiz;

    @Autowired
    private BizTemplate bizTemplate;

    /**
     * 注册接口
     * URL: POST http://localhost:8080/user/register
     */
    @PostMapping("/register")
    public Result<String> register(@RequestBody UserRegisterRequest request) {
        // 使用 BizTemplate 统一处理异常
        return bizTemplate.execute(() -> {
            // 只有一行代码：调用大厨的方法
            return userBiz.register(request.getUsername(), request.getPassword(), request.getNickname());
        });
    }
    /**
     * 登录接口
     * URL: POST http://localhost:8080/user/login
     */
    @PostMapping("/login")
    public Result<UserEntity> login(@RequestBody UserLoginRequest request) {
        return bizTemplate.execute(() -> {
            return userBiz.login(request.getUsername(), request.getPassword());
        });
    }
}