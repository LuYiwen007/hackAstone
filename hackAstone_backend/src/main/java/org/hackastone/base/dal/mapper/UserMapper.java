package org.hackastone.base.dal.mapper;

import org.apache.ibatis.annotations.Param;
import org.hackastone.base.dal.entity.UserEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMapper {

    /**
     * 新增用户
     */
    int insert(UserEntity userEntity);

    /**
     * 根据用户名查询（用于登录和检查重名）
     */
    UserEntity selectByUsername(@Param("username") String username);

    /**
     * 根据用户ID查询
     */
    UserEntity selectById(@Param("userId") String userId);

    /**
     * 更新扩展信息
     */
    int updateExtInfo(@Param("userId") String userId, @Param("extInfo") String extInfo);
}
