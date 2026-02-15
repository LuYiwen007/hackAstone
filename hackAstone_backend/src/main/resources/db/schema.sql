/*
 * HackAstone 项目完整数据库初始化脚本
 * 基于项目文档 V1.0
 * 数据库版本: MySQL 8.0+
 */

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `hackastone` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hackastone`;

-- ==========================================
-- 1. ID序列号表 (id_sequence)
-- ==========================================
DROP TABLE IF EXISTS `id_sequence`;
CREATE TABLE `id_sequence` (
  `entity_type` VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '实体类型（如：USR, PLN, UDT, AIC等）',
  `current_value` BIGINT NOT NULL DEFAULT 0 COMMENT '当前序列号值',
  `step` INT NOT NULL DEFAULT 1 COMMENT '步长',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ID序列号表';

-- 初始化序列号数据
INSERT INTO `id_sequence` (`entity_type`, `current_value`, `step`) VALUES
('USR', 0, 1),  -- 用户 ID 序列
('PLN', 0, 1),  -- 计划 ID 序列
('UDT', 0, 1),  -- 使用数据 ID 序列
('AIC', 0, 1);  -- AI对话 ID 序列

-- ==========================================
-- 2. 用户账户表 (ha_user)
-- ==========================================
DROP TABLE IF EXISTS `ha_user`;
CREATE TABLE `ha_user` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '用户ID（主键）',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `phone` VARCHAR(20) COMMENT '手机号',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar_url` VARCHAR(255) COMMENT '头像URL',
  `status` VARCHAR(32) NOT NULL DEFAULT 'ENABLED' COMMENT '状态：ENABLED-正常，DISABLED-禁用，DELETED-删除',
  `ext_info` MEDIUMTEXT NULL COMMENT '扩展信息（JSON格式）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_username` (`username`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户账户表';

-- ==========================================
-- 3. 计划内容表 (ha_plan)
-- ==========================================
DROP TABLE IF EXISTS `ha_plan`;
CREATE TABLE `ha_plan` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '计划ID（主键）',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '计划标题',
  `description` TEXT COMMENT '计划描述',
  `plan_type` VARCHAR(50) COMMENT '计划类型',
  `status` VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED' COMMENT '状态：NOT_STARTED-未开始，IN_PROGRESS-执行中...',
  `start_date` DATETIME COMMENT '开始时间',
  `end_date` DATETIME COMMENT '结束时间',
  `priority` INT DEFAULT 0 COMMENT '优先级：0-低，1-中，2-高',
  `tags` JSON COMMENT '标签（JSON数组）',
  `ext_info` MEDIUMTEXT NULL COMMENT '扩展信息（JSON格式）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_status` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='计划内容表';

-- ==========================================
-- 4. 用户使用数据表 (ha_usage_data)
-- ==========================================
DROP TABLE IF EXISTS `ha_usage_data`;
CREATE TABLE `ha_usage_data` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '数据ID（主键）',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `plan_id` VARCHAR(64) NULL COMMENT '关联计划ID（可选）',
  `data_type` VARCHAR(50) NOT NULL COMMENT '数据类型：VIEW_PLAN, CREATE_PLAN等',
  `action` VARCHAR(100) COMMENT '具体操作',
  `duration` INT COMMENT '使用时长（秒）',
  `metadata` JSON COMMENT '额外数据（JSON对象）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_data_type` (`data_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户使用数据表';

-- ==========================================
-- 5. AI对话内容表 (ha_ai_conversation)
-- ==========================================
DROP TABLE IF EXISTS `ha_ai_conversation`;
CREATE TABLE `ha_ai_conversation` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '对话ID（主键）',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `session_id` VARCHAR(64) NOT NULL COMMENT '会话ID（一次对话会话的唯一标识）',
  `role` VARCHAR(20) NOT NULL COMMENT '角色：USER-用户，ASSISTANT-AI助手',
  `content` TEXT NOT NULL COMMENT '对话内容',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_session` (`user_id`, `session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话内容表';