package org.hackastone.biz;

import org.hackastone.base.dal.entity.UserEntity;
import org.hackastone.base.dal.mapper.UserMapper;
import org.hackastone.base.util.constants.ResultEnum;
import org.hackastone.base.util.exception.HackAstoneBizException;
import org.hackastone.core.component.IdGenerator;
import org.hackastone.core.component.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class UserBiz {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private IdGenerator idGenerator;

    @Autowired
    private PasswordHasher passwordHasher;

    /**
     * 注册：分配 uid（USR0001…），邮箱与昵称唯一，密码 BCrypt 存储
     */
    public String register(String email, String password, String nickname) {
        String normalizedEmail = normalizeEmail(email);
        String trimmedNickname = trim(nickname);

        if (!StringUtils.hasText(normalizedEmail) || !EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "邮箱格式不正确");
        }
        if (!StringUtils.hasText(trimmedNickname)) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "昵称不能为空");
        }
        if (!StringUtils.hasText(password) || password.length() < 6) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "密码至少 6 位");
        }

        if (userMapper.selectByEmail(normalizedEmail) != null) {
            throw new HackAstoneBizException(ResultEnum.USER_EXIST.getCode(), "该邮箱已被注册");
        }
        if (userMapper.selectByNickname(trimmedNickname) != null) {
            throw new HackAstoneBizException(ResultEnum.USER_EXIST.getCode(), "该昵称已被使用");
        }

        String userId = idGenerator.generate("USR", "USR");

        UserEntity newUser = new UserEntity();
        newUser.setUserId(userId);
        newUser.setUsername(userId);
        newUser.setEmail(normalizedEmail);
        newUser.setNickname(trimmedNickname);
        newUser.setPassword(passwordHasher.hash(password));

        userMapper.insert(newUser);
        return userId;
    }

    /**
     * 登录：支持昵称或邮箱 + 密码
     */
    public UserEntity login(String account, String password) {
        String loginKey = trim(account);
        if (loginKey.contains("@")) {
            loginKey = loginKey.toLowerCase(Locale.ROOT);
        }
        if (!StringUtils.hasText(loginKey) || !StringUtils.hasText(password)) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR);
        }

        UserEntity user = userMapper.selectByLoginAccount(loginKey);
        if (user == null) {
            throw new HackAstoneBizException(ResultEnum.USER_NOT_EXIST);
        }

        if (!passwordHasher.matches(password, user.getPassword())) {
            throw new HackAstoneBizException(ResultEnum.PASSWORD_ERROR);
        }

        if (!passwordHasher.isBcryptHash(user.getPassword())) {
            userMapper.updatePasswordHash(user.getUserId(), passwordHasher.hash(password));
        }

        user.setPassword(null);
        return user;
    }

    public UserEntity getCurrentUser(String userId) {
        UserEntity user = userMapper.selectById(userId);
        if (user == null || !"ENABLED".equals(user.getStatus())) {
            throw new HackAstoneBizException(ResultEnum.USER_NOT_EXIST);
        }
        user.setPassword(null);
        return user;
    }

    public UserEntity updateNickname(String userId, String nickname) {
        String trimmedNickname = trim(nickname);
        if (!StringUtils.hasText(trimmedNickname)) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "昵称不能为空");
        }
        UserEntity existing = userMapper.selectByNicknameExceptUser(trimmedNickname, userId);
        if (existing != null) {
            throw new HackAstoneBizException(ResultEnum.USER_EXIST.getCode(), "该昵称已被使用");
        }
        userMapper.updateNickname(userId, trimmedNickname);
        return getCurrentUser(userId);
    }

    public void changePassword(String userId, String oldPassword, String newPassword) {
        if (!StringUtils.hasText(oldPassword) || !StringUtils.hasText(newPassword)) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR);
        }
        if (newPassword.length() < 6) {
            throw new HackAstoneBizException(ResultEnum.PARAM_ERROR.getCode(), "新密码至少 6 位");
        }
        UserEntity user = userMapper.selectById(userId);
        if (user == null) {
            throw new HackAstoneBizException(ResultEnum.USER_NOT_EXIST);
        }
        if (!passwordHasher.matches(oldPassword, user.getPassword())) {
            throw new HackAstoneBizException(ResultEnum.PASSWORD_ERROR);
        }
        userMapper.updatePasswordHash(userId, passwordHasher.hash(newPassword));
    }

    private static String normalizeEmail(String email) {
        return trim(email).toLowerCase(Locale.ROOT);
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
