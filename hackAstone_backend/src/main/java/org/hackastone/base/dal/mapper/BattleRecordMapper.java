package org.hackastone.base.dal.mapper;

import org.apache.ibatis.annotations.Param;
import org.hackastone.base.dal.entity.BattleRecordEntity;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleRecordMapper {

    int insert(BattleRecordEntity record);

    List<BattleRecordEntity> selectByUserId(@Param("userId") String userId);

    List<BattleRecordEntity> selectRecentByUserId(@Param("userId") String userId, @Param("limit") int limit);

    int countByUserId(@Param("userId") String userId);

    int countChangedStanceByUserId(@Param("userId") String userId);
}
