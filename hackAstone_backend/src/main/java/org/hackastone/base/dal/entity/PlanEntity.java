package org.hackastone.base.dal.entity;

import lombok.Data;
import java.util.Date;

@Data
public class PlanEntity {
    private String id;
    private String userId;
    private String title;
    private String description;
    private String planType;
    private String status;
    private Date startDate;
    private Date endDate;
    private Integer priority;
    private String tags;
    /** 扩展信息 JSON，AI 计划存 totalDuration, dailyStudyTime, stages */
    private String extInfo;
    private Date createdAt;
    private Date updatedAt;
}
