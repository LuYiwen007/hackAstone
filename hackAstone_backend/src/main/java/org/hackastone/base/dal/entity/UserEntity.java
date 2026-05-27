package org.hackastone.base.dal.entity;

import lombok.Data;
import java.util.Date;

@Data
public class UserEntity {
    // 对应数据库 id
    private String userId;

    // 对应数据库 username（内部标识，可与 uid 一致）
    private String username;

    // 对应数据库 email
    private String email;

    // 对应数据库 phone
    private String phone;

    // 对应数据库 password_hash
    private String password;

    // 对应数据库 nickname
    private String nickname;

    // 对应数据库 avatar_url
    private String avatarUrl;

    // 对应数据库 status (ENABLED/DISABLED/DELETED)
    private String status;

    // 对应数据库 ext_info (JSON)
    private String extInfo;

    // 对应数据库 created_at
    private Date createdAt;

    // 对应数据库 updated_at
    private Date updatedAt;
}
