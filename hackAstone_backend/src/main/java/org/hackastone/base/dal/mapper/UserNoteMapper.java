package org.hackastone.base.dal.mapper;

import org.apache.ibatis.annotations.Param;
import org.hackastone.base.dal.entity.UserNoteEntity;

public interface UserNoteMapper {

    int insert(UserNoteEntity entity);

    int updateContent(@Param("id") String id, @Param("userId") String userId,
                      @Param("content") String content, @Param("topic") String topic);

    UserNoteEntity selectByUserAndSource(@Param("userId") String userId,
                                           @Param("sourceType") String sourceType,
                                           @Param("sourceKey") String sourceKey);
}
