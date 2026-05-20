package org.hackastone.controller.model;

import lombok.Data;

@Data
public class UserChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
}
