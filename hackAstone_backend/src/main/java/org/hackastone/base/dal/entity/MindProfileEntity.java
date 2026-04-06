package org.hackastone.base.dal.entity;

import lombok.Data;

import java.util.Date;

@Data
public class MindProfileEntity {
    private String userId;
    private String profileJson;
    private Date createdAt;
    private Date updatedAt;
}
