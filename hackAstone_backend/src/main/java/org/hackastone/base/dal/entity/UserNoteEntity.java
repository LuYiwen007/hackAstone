package org.hackastone.base.dal.entity;

import lombok.Data;

import java.util.Date;

@Data
public class UserNoteEntity {
    private String id;
    private String userId;
    private String sourceType;
    private String sourceKey;
    private String topic;
    private String content;
    private Date createdAt;
    private Date updatedAt;
}
