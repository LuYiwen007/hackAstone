package org.hackastone.controller.model;

import lombok.Data;

@Data
public class UserLoginRequest {
    private String username;
    private String password;
}
