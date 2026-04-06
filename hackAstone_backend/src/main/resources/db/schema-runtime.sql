CREATE DATABASE IF NOT EXISTS `hackastone`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `hackastone`;

CREATE TABLE IF NOT EXISTS `id_sequence` (
  `entity_type` VARCHAR(32) NOT NULL PRIMARY KEY,
  `current_value` BIGINT NOT NULL DEFAULT 0,
  `step` INT NOT NULL DEFAULT 1,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `id_sequence` (`entity_type`, `current_value`, `step`) VALUES
('USR', 0, 1),
('PLN', 0, 1),
('UDT', 0, 1),
('AIC', 0, 1)
ON DUPLICATE KEY UPDATE
  `step` = VALUES(`step`);

CREATE TABLE IF NOT EXISTS `ha_user_account` (
  `user_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50) DEFAULT NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT 'USER',
  `status` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ha_plan` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `plan_type` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
  `start_date` DATETIME DEFAULT NULL,
  `end_date` DATETIME DEFAULT NULL,
  `priority` INT DEFAULT 0,
  `tags` TEXT DEFAULT NULL,
  `ext_info` MEDIUMTEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ha_usage_data` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `plan_id` VARCHAR(64) DEFAULT NULL,
  `data_type` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) DEFAULT NULL,
  `duration` INT DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ha_ai_conversation` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `session_id` VARCHAR(64) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ha_mind_profile` (
  `user_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `profile_json` MEDIUMTEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
