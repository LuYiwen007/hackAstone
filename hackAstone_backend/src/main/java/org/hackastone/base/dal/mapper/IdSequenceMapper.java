package org.hackastone.base.dal.mapper;

import org.apache.ibatis.annotations.Param;
import org.hackastone.base.dal.entity.IdSequenceEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface IdSequenceMapper {

    /**
     * 悲观锁查询：查询时锁住这行记录，防止多人同时抢同一个号
     */
    IdSequenceEntity selectByTypeForUpdate(@Param("entityType") String entityType);

    /**
     * 更新当前值
     */
    int updateCurrentValue(@Param("entityType") String entityType, @Param("newValue") Long newValue);
}