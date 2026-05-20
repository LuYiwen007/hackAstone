package org.hackastone.base.dal.entity;

import lombok.Data;
import java.util.Date;

@Data
public class BattleRecordEntity {
    private String id;
    private String userId;
    private String battleType;
    private String topic;
    private String userChoice;
    private String judgeSummary;
    private Integer changedStance;
    private String messages;
    private Date createdAt;
}
