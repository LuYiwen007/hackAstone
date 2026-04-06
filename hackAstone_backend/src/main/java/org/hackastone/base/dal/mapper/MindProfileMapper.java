package org.hackastone.base.dal.mapper;

import org.apache.ibatis.annotations.Param;
import org.hackastone.base.dal.entity.MindProfileEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface MindProfileMapper {

    MindProfileEntity selectByUserId(@Param("userId") String userId);

    int upsert(@Param("userId") String userId, @Param("profileJson") String profileJson);
}
