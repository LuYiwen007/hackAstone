package org.hackastone.biz;

import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.dal.mapper.UserMapper;
import org.hackastone.base.util.constants.ResultEnum;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.hackastone.core.component.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserBiz {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private IdGenerator idGenerator;

    /**
     * 用户注册逻辑
     */
    public String register(String username, String password, String nickname) {
        // 1. 检查用户名是否已存在
        UserEntity existUser = userMapper.selectByUsername(username);
        if (existUser != null) {
            // 如果查到了，说明重名了，抛出异常
            throw new HackAstoneBizException(ResultEnum.USER_EXIST);
        }

        // 2. 生成新用户ID (使用我们刚才写的发号器)
        // 对应数据库中的 'USR' 类型
        String userId = idGenerator.generate("USR", "USR");

        // 3. 组装用户实体
        UserEntity newUser = new UserEntity();
        newUser.setUserId(userId);
        newUser.setUsername(username);
        newUser.setNickname(nickname);
        // 注意：实际项目中密码需要加密（如MD5或BCrypt），这里为了简化先存明文
        newUser.setPassword(password); 

        // 4. 存入数据库
        userMapper.insert(newUser);

        return userId;
    }
    /**
     * 用户登录逻辑
     */
    public UserEntity login(String username, String password) {
        // 1. 根据用户名查询用户
        UserEntity user = userMapper.selectByUsername(username);

        // 2. 检查用户是否存在
        if (user == null) {
            throw new HackAstoneBizException(ResultEnum.USER_NOT_EXIST);
        }

        // 3. 检查密码是否正确
        // (注意：实际项目中密码是加密的，这里我们暂时用明文比对)
        if (!user.getPassword().equals(password)) {
            throw new HackAstoneBizException(ResultEnum.PASSWORD_ERROR);
        }

        // 4. 登录成功，为了安全，把密码抹掉再返回给前端
        user.setPassword(null);
        
        return user;
    }
}