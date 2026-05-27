package org.hackastone.biz;

import org.hackastone.base.dal.entity.UserNoteEntity;
import org.hackastone.base.dal.mapper.UserNoteMapper;
import org.hackastone.core.component.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserNoteService {

    @Autowired
    private UserNoteMapper userNoteMapper;

    @Autowired
    private IdGenerator idGenerator;

    public UserNoteEntity saveOrUpdate(String userId, String sourceType, String sourceKey,
                                       String topic, String content) {
        UserNoteEntity existing = userNoteMapper.selectByUserAndSource(userId, sourceType, sourceKey);
        if (existing != null) {
            userNoteMapper.updateContent(existing.getId(), userId, content, topic);
            existing.setContent(content);
            existing.setTopic(topic);
            return existing;
        }
        UserNoteEntity entity = new UserNoteEntity();
        entity.setId(idGenerator.generate("NOTE", "NOTE"));
        entity.setUserId(userId);
        entity.setSourceType(sourceType);
        entity.setSourceKey(sourceKey);
        entity.setTopic(topic);
        entity.setContent(content);
        userNoteMapper.insert(entity);
        return entity;
    }

    public UserNoteEntity getNote(String userId, String sourceType, String sourceKey) {
        return userNoteMapper.selectByUserAndSource(userId, sourceType, sourceKey);
    }
}
