package org.hackastone.base.dal.mapper;

import org.apache.ibatis.annotations.Param;
import org.hackastone.base.dal.entity.PlanEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanMapper {

    int insert(PlanEntity plan);

    PlanEntity selectById(@Param("id") String id);
}
