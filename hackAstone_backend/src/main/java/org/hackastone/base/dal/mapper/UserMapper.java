package org.hackastone.base.dal.mapper;

import org.apache.ibatis.annotations.Param;
import org.hackastone.base.dal.entity.UserEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMapper {

    int insert(UserEntity userEntity);

    UserEntity selectByUsername(@Param("username") String username);

    UserEntity selectByEmail(@Param("email") String email);

    UserEntity selectByNickname(@Param("nickname") String nickname);

    /** 昵称、邮箱或历史 username 登录 */
    UserEntity selectByLoginAccount(@Param("account") String account);

    UserEntity selectById(@Param("userId") String userId);

    int updateExtInfo(@Param("userId") String userId, @Param("extInfo") String extInfo);

    int updatePasswordHash(@Param("userId") String userId, @Param("passwordHash") String passwordHash);

    int updateNickname(@Param("userId") String userId, @Param("nickname") String nickname);

    UserEntity selectByNicknameExceptUser(@Param("nickname") String nickname, @Param("userId") String userId);
}
