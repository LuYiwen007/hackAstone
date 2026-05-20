package org.hackastone.biz;

import org.hackastone.base.dal.entity.BattleRecordEntity;
import org.hackastone.base.dal.mapper.BattleRecordMapper;
import org.hackastone.core.component.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BattleRecordService {

    @Autowired
    private BattleRecordMapper battleRecordMapper;

    @Autowired
    private IdGenerator idGenerator;

    public void saveRecord(BattleRecordEntity record) {
        if (record.getId() == null) {
            record.setId(idGenerator.generate("BAT", "BAT"));
        }
        battleRecordMapper.insert(record);
    }

    public List<BattleRecordEntity> getRecentRecords(String userId, int limit) {
        return battleRecordMapper.selectRecentByUserId(userId, limit);
    }

    public int getTotalCount(String userId) {
        return battleRecordMapper.countByUserId(userId);
    }

    public int getChangedStanceCount(String userId) {
        return battleRecordMapper.countChangedStanceByUserId(userId);
    }
}
