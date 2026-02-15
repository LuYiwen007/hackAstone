package org.hackastone.controller.model;

import lombok.Data;

@Data
public class UserRegisterRequest {
    // 前端传过来的用户名
    private String username;
    
    // 前端传过来的密码
    private String password;
    
    // 前端传过来的昵称
    private String nickname;
}