package org.hackastone.base.dal.entity;

import lombok.Data;

@Data
public class IdSequenceEntity {
    // 对应数据库的 entity_type 字段 (如 "USR")
    private String entityType;
    
    // 对应数据库的 current_value 字段
    private Long currentValue;
    
    // 对应数据库的 step 字段
    private Integer step;
}