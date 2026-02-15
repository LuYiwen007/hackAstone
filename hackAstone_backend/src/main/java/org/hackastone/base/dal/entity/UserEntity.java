package org.hackastone.base.dal.entity;

import lombok.Data;
import java.util.Date;

@Data
public class UserEntity {
    // 对应数据库 user_id
    private String userId;

    // 对应数据库 username
    private String username;

    // 对应数据库 password
    private String password;

    // 对应数据库 nickname
    private String nickname;

    // 对应数据库 role (默认 USER)
    private String role;

    // 对应数据库 status (1正常, 0禁用)
    private Integer status;

    // 对应数据库 created_at
    private Date createdAt;
}