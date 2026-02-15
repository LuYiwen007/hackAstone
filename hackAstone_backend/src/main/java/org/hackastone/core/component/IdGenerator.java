package org.hackastone.core.component;

import org.hackastone.base.dal.entity.IdSequenceEntity;
import org.hackastone.base.dal.mapper.IdSequenceMapper;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class IdGenerator {

    @Autowired
    private IdSequenceMapper idSequenceMapper;

    /**
     * 生成下一个 ID
     * @param entityType 数据库里的类型 (如 "USR", "PLN")
     * @param prefix ID前缀 (如 "USR")
     * @return 格式化后的ID (如 "USR0001")
     */
    @Transactional
    public String generate(String entityType, String prefix) {
        // 1. 锁定并查询当前值
        IdSequenceEntity entity = idSequenceMapper.selectByTypeForUpdate(entityType);
        
        if (entity == null) {
            throw new HackAstoneBizException("ID生成失败: 类型不存在 -> " + entityType);
        }

        // 2. 计算下一个值 (当前值 + 步长)
        long nextValue = entity.getCurrentValue() + entity.getStep();

        // 3. 更新回数据库
        idSequenceMapper.updateCurrentValue(entityType, nextValue);

        // 4. 拼接字符串 (保留 4 位数字，不足补0)
        // 例如：prefix="USR", nextValue=1 -> "USR0001"
        return prefix + String.format("%04d", nextValue);
    }
}