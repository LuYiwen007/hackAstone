package org.hackastone.controller.model;

import lombok.Data;

@Data
public class UserRegisterRequest {
    /** 注册邮箱 */
    private String email;

    /** 登录密码 */
    private String password;

    /** 昵称（登录时也可作为账号） */
    private String nickname;
}