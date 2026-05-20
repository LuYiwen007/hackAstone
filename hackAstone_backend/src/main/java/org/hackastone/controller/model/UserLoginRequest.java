package org.hackastone.controller.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class UserLoginRequest {
    /** 昵称或邮箱 */
    @JsonAlias("username")
    private String account;

    private String password;
}
