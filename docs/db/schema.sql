
DROP TABLE IF EXISTS `system_config`;
DROP TABLE IF EXISTS `auth_log`;
DROP TABLE IF EXISTS `auth_token`;
DROP TABLE IF EXISTS `auth_number`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `sns_accounts`;
DROP TABLE IF EXISTS `user_favorites`;
DROP TABLE IF EXISTS `users`;

DROP TABLE IF EXISTS `codes`;
DROP TABLE IF EXISTS `code_groups`;
DROP TABLE IF EXISTS `files`;


/* == Common =======================*/

CREATE TABLE IF NOT EXISTS `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL COMMENT 'File Name',
  `original_name` varchar(255) NOT NULL COMMENT 'Original Name',
  `path` varchar(255) NOT NULL COMMENT 'File Path',
  `destination` varchar(255) DEFAULT NULL COMMENT 'Destination',
  `size` INT(11) DEFAULT 0 COMMENT 'File Size',
  `mime_type` varchar(50) DEFAULT NULL COMMENT 'File Size',
  `url` varchar(255) DEFAULT NULL COMMENT 'File Url',
  `image_width` SMALLINT(6) DEFAULT 0 COMMENT 'Image Width ',
  `image_height` SMALLINT(6) DEFAULT 0 COMMENT 'Image Height',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='File Info';

/* == codes =======================*/

CREATE TABLE IF NOT EXISTS `code_groups` (
  `grp_code` varchar(20) NOT NULL COMMENT 'Group Code',
  `name` varchar(100) NOT NULL COMMENT 'Code Group Name',
  `memo` varchar(500) DEFAULT NULL COMMENT 'Memo',
  `order_sn` smallint(6) DEFAULT 1 COMMENT 'Order Sequence',
  `enabled` tinyint(1) DEFAULT 1 COMMENT 'Enabled',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  PRIMARY KEY (`grp_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Code Groups';

CREATE TABLE IF NOT EXISTS `codes` (
  `code` varchar(20) NOT NULL COMMENT 'Code',
  `grp_code` varchar(20) NOT NULL COMMENT 'Group Code',
  `name` varchar(100) NOT NULL COMMENT 'Code Name',
  `value` varchar(50) DEFAULT NULL COMMENT 'Code Value',
  `memo` varchar(500) DEFAULT NULL COMMENT 'Memo',
  `order_sn` smallint(6) DEFAULT 1 COMMENT 'Order Sequence',
  `enabled` tinyint(1) DEFAULT 1 COMMENT 'Enabled',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  PRIMARY KEY (`code`),
  FOREIGN KEY(grp_code) REFERENCES code_groups(grp_code) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Code';

/* == users =======================*/

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login_id` varchar(100) NOT NULL COMMENT '로그인 ID',
  `name` varchar(255) NOT NULL COMMENT '이름',
  `password` varchar(100) NOT NULL COMMENT '비밀번호',
  `profile_image` int(11) DEFAULT NULL COMMENT '프로필 이미지',
  `birth_year` smallint(4) DEFAULT NULL COMMENT '생년',
  `mobile_number` varchar(20) DEFAULT NULL COMMENT '핸드폰 번호',
  `email` varchar(100) DEFAULT NULL COMMENT '이메일 주소',
  `website` varchar(255) DEFAULT NULL COMMENT '웹사이트',
  `role_code` varchar(20) DEFAULT NULL COMMENT '그룹 코드',
  `batch_code` varchar(20) DEFAULT NULL COMMENT '기수 코드',
  `memo` text DEFAULT NULL COMMENT '메모',

  `company_name` varchar(255) DEFAULT NULL COMMENT '직장명',
  `office_address` varchar(255) DEFAULT NULL COMMENT '사무실 주소',
  `office_phone` varchar(20) DEFAULT NULL COMMENT '사무실 전화번호',
  `level` varchar(100) DEFAULT NULL COMMENT '직급',
  `job` varchar(100) DEFAULT NULL COMMENT '직책',
  `major` varchar(255) DEFAULT NULL COMMENT '전공/업무',
  `degree_code` varchar(20) DEFAULT NULL COMMENT '학위 코드',
  `course_code` varchar(20) DEFAULT NULL COMMENT '과정 코드',
  `advisor` varchar(255) DEFAULT NULL COMMENT '지도 교수',

  `graduated` tinyint(1) DEFAULT '0' COMMENT '졸업 여부',
  `is_public` tinyint(1) DEFAULT '1' COMMENT '공개 여부',
  `is_public_mobile` tinyint(1) DEFAULT '1' COMMENT '공개 여부(모바일)',
  `is_public_office` tinyint(1) DEFAULT '1' COMMENT '공개 여부(오피스번호)',
  `is_public_email` tinyint(1) DEFAULT '1' COMMENT '공개 여부(이메일)',
  `is_public_department` tinyint(1) DEFAULT '1' COMMENT '공개 여부(직장)',
  `is_public_birth` tinyint(1) DEFAULT '1' COMMENT '공개 여부(생년)',
  `enabled` tinyint(1) DEFAULT '1' COMMENT '사용 여부',

  `last_login_dt` datetime DEFAULT NULL COMMENT 'Last Data Time',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Deleted Time',
  PRIMARY KEY (`id`),
  UNIQUE (login_id),
  UNIQUE (mobile_number),
  FOREIGN KEY(profile_image) REFERENCES files(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(role_code) REFERENCES codes(code) ON UPDATE CASCADE,
  FOREIGN KEY(batch_code) REFERENCES codes(code) ON UPDATE CASCADE,
  FOREIGN KEY(degree_code) REFERENCES codes(code) ON UPDATE CASCADE,
  FOREIGN KEY(course_code) REFERENCES codes(code) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User Info';

CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `target_id` int(11) NOT NULL COMMENT 'Target User ID',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  PRIMARY KEY (`id`),
  FOREIGN KEY(user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY(target_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='User Favorites';

CREATE TABLE IF NOT EXISTS `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_code` varchar(20) NOT NULL COMMENT 'Document Type',
  `title` varchar(255) NOT NULL COMMENT 'Title',
  `content` longtext DEFAULT NULL COMMENT 'Content',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  PRIMARY KEY (`id`),
  FOREIGN KEY(type_code) REFERENCES codes(code) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Code';


/* == auth =======================*/

CREATE TABLE IF NOT EXISTS `auth_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `refresh_token` varchar(255) NOT NULL COMMENT 'jwt refresh token',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `expired_at` datetime NOT NULL COMMENT 'Expire Time',
  PRIMARY KEY (`id`),
  FOREIGN KEY(user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='JWT Auth Token';

CREATE TABLE IF NOT EXISTS `auth_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `ip` varchar(100) DEFAULT NULL COMMENT 'IP Address',
  `user_agent` varchar(500) DEFAULT NULL COMMENT 'User Agent',
  `result` tinyint(1) DEFAULT NULL COMMENT 'Result',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  PRIMARY KEY (`id`),
  FOREIGN KEY(user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Auth Log';

CREATE TABLE IF NOT EXISTS `auth_number` (
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `auth_number` varchar(10) NOT NULL COMMENT 'Auth Number',
  `ip` varchar(100) DEFAULT NULL COMMENT 'IP Address',
  `user_agent` varchar(500) DEFAULT NULL COMMENT 'User Agent',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Auth Number';

CREATE TABLE IF NOT EXISTS `sns_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'User ID',
  `sns_provider` varchar(255) NOT NULL COMMENT 'sns_provider',
  `sns_id` varchar(255) NOT NULL COMMENT 'sns_id',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  PRIMARY KEY (`id`),
  FOREIGN KEY(user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='SNS Accounts';

CREATE TABLE IF NOT EXISTS `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'Config Name',
  `value` varchar(255) NOT NULL COMMENT 'Config Value',
  `memo` varchar(500) DEFAULT NULL COMMENT 'Memo',
  `min` int(11) default NULL COMMENT 'Minimum Value',
  `max` int(11) default NULL COMMENT 'Maximum Value',
  `order_sn` smallint(6) DEFAULT 1 COMMENT 'Order Sequence',
  `editable` tinyint(1) DEFAULT 1 COMMENT 'Enabled',
  `enabled` tinyint(1) DEFAULT 1 COMMENT 'Enabled',
  `created_at` datetime DEFAULT NOW() COMMENT 'Created Time',
  `updated_at` datetime DEFAULT NULL COMMENT 'Updated Time',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Deleted Time',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='System Environment Config';


/* == init data insert =======================*/

DELETE FROM `code_groups`;
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('BATCH_TY', 'Batch Type', NULL, 1, 1, '2024-12-07 08:59:13', NULL);
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('DOC_TY', 'Document Type', NULL, 1, 1, '2024-12-07 08:58:33', NULL);
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('ENABLE_TY', 'Enabled Type', NULL, 1, 1, '2024-12-07 05:42:28', NULL);
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('ROLE_TY', 'Role Type', NULL, 1, 1, '2024-12-07 08:58:44', NULL);
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('SORT_TY', 'Sort Ascending', NULL, 1, 1, '2024-12-07 05:42:28', NULL);
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('URL_TY', 'URL Type', NULL, 1, 1, '2024-12-07 05:42:28', NULL);
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('DEGREE_TY', 'Degree Type', NULL, 1, 1, '2024-12-07 08:59:54', NULL);
INSERT INTO `code_groups` (`grp_code`, `name`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('COURSE_TY', 'Course Type', NULL, 1, 1, '2024-12-07 09:00:08', NULL);

DELETE FROM `codes`;
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('COURSE_1', 'COURSE_TY', '석사과정', NULL, NULL, 1, 1, '2024-12-07 09:04:05', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('COURSE_2', 'COURSE_TY', '석박사통합', NULL, NULL, 2, 1, '2024-12-07 09:04:15', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('COURSE_3', 'COURSE_TY', '박사과정', NULL, NULL, 3, 1, '2024-12-07 09:04:15', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('DEGREE_1', 'DEGREE_TY', '석사', NULL, NULL, 1, 1, '2024-12-07 09:03:32', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('DEGREE_2', 'DEGREE_TY', '박사', NULL, NULL, 2, 1, '2024-12-07 09:03:44', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('DOC_HELP', 'DOC_TY', '도움말', NULL, NULL, 2, 1, '2024-12-07 09:05:20', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('DOC_NOTICE', 'DOC_TY', '공지사항', NULL, NULL, 1, 1, '2024-12-07 09:04:52', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('DOC_POLICY', 'DOC_TY', '이용약관 및 정책', NULL, NULL, 3, 1, '2024-12-07 09:06:13', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('ENABLE_FALSE', 'ENABLE_TY', 'N', '0', NULL, 2, 1, '2024-12-07 05:42:28', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('ENABLE_TRUE', 'ENABLE_TY', 'Y', '1', NULL, 1, 1, '2024-12-07 05:42:28', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('ROLE_ADMIN', 'ROLE_TY', 'Admin', 'admin', NULL, 1, 1, '2024-12-07 09:01:49', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('ROLE_USER', 'ROLE_TY', 'User', 'user', NULL, 2, 1, '2024-12-07 09:02:02', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('SORT_ASC', 'SORT_TY', 'Asc', 'asc', NULL, 1, 1, '2024-12-07 05:42:28', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('SORT_DESC', 'SORT_TY', 'Desc', 'desc', NULL, 2, 1, '2024-12-07 05:42:28', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('BATCH_1', 'BATCH_TY', '1기', NULL, NULL, 1, 1, '2024-12-07 09:02:40', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('BATCH_2', 'BATCH_TY', '2기', NULL, NULL, 2, 1, '2024-12-07 09:02:50', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('BATCH_3', 'BATCH_TY', '3기', NULL, NULL, 3, 1, '2024-12-07 09:02:56', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('BATCH_4', 'BATCH_TY', '4기', NULL, NULL, 4, 1, '2024-12-07 09:02:56', NULL);
INSERT INTO `codes` (`code`, `grp_code`, `name`, `value`, `memo`, `order_sn`, `enabled`, `created_at`, `updated_at`) VALUES ('BATCH_5', 'BATCH_TY', '5기', NULL, NULL, 5, 1, '2024-12-07 09:02:56', NULL);

DELETE FROM `users`;
INSERT INTO `users` (`id`, `login_id`, `name`, `password`, `profile_image`, `birth_year`, `mobile_number`, `email`, `role_code`, `batch_code`, `memo`, `is_public`, `enabled`, `last_login_dt`, `created_at`, `updated_at`, `deleted_at`) VALUES (1, 'admin', 'admin', '$2a$10$AquD417HSyy7ZOb6XeeHdO2TFwGapu3A/Pv4YeQN4XBhTwQoHNv4K', NULL, NULL, '010-1111-1111', 'admin@gmail.com', 'ROLE_ADMIN', 'BATCH_1', NULL, 1, 1, NULL, '2024-12-07 05:42:28', '2024-12-07 10:01:29', NULL);
INSERT INTO `users` (`id`, `login_id`, `name`, `password`, `profile_image`, `birth_year`, `mobile_number`, `email`, `role_code`, `batch_code`, `memo`, `is_public`, `enabled`, `last_login_dt`, `created_at`, `updated_at`, `deleted_at`) VALUES (3, 'user1', 'user1', '$2a$10$AquD417HSyy7ZOb6XeeHdO2TFwGapu3A/Pv4YeQN4XBhTwQoHNv4K', NULL, NULL, '010-1111-1112', 'user1@gmail.com', 'ROLE_USER', 'BATCH_1', NULL, 1, 1, NULL, '2024-12-07 10:02:44', '2024-12-07 10:02:44', NULL);


DELETE FROM `documents`;
INSERT INTO `documents` (`id`, `type_code`, `title`, `content`, `created_at`, `updated_at`) VALUES (1, 'DOC_NOTICE', '공지1', '공지1', '2024-12-08 00:06:56', NULL);
INSERT INTO `documents` (`id`, `type_code`, `title`, `content`, `created_at`, `updated_at`) VALUES (2, 'DOC_NOTICE', '공지2', '공지2', '2024-12-08 00:07:10', NULL);
INSERT INTO `documents` (`id`, `type_code`, `title`, `content`, `created_at`, `updated_at`) VALUES (3, 'DOC_HELP', '도움말1', '도움말1', '2024-12-08 00:07:17', NULL);
INSERT INTO `documents` (`id`, `type_code`, `title`, `content`, `created_at`, `updated_at`) VALUES (4, 'DOC_HELP', '도움말2', '도움말2', '2024-12-08 00:07:30', NULL);
INSERT INTO `documents` (`id`, `type_code`, `title`, `content`, `created_at`, `updated_at`) VALUES (5, 'DOC_POLICY', '이용약관', '이용약관', '2024-12-08 00:07:43', NULL);
INSERT INTO `documents` (`id`, `type_code`, `title`, `content`, `created_at`, `updated_at`) VALUES (6, 'DOC_POLICY', '개인정보처리방침', '개인정보처리방침', '2024-12-08 00:09:05', NULL);
INSERT INTO `documents` (`id`, `type_code`, `title`, `content`, `created_at`, `updated_at`) VALUES (7, 'DOC_POLICY', '개인정보 공개설정 동의', '개인정보 공개설정 동의', '2024-12-08 00:09:16', NULL);

INSERT INTO `system_config` (`id`, `name`, `value`, `order_sn`, `memo`) VALUES (1, 'EMAIL_SENDER', 'test@gmail.com', 1, 'Google Gmail 계정, 2단계 인증 설정 필요함.');
INSERT INTO `system_config` (`id`, `name`, `value`, `order_sn`, `memo`) VALUES (2, 'EMAIL_PW', 'aaa', 2, '앱 비밀번호 생성 후 입력');
INSERT INTO `system_config` (`id`, `name`, `value`, `order_sn`, `memo`) VALUES (3, 'SMS_SENDER', '07012345678', 3, '발신번호 인증 필요함.');
INSERT INTO `system_config` (`id`, `name`, `value`, `order_sn`, `memo`) VALUES (4, 'SMS_API_KEY', 'NCSP6BSPDDVVNJTE', 4, 'CoolSms Api Key, https://coolsms.co.kr/');
INSERT INTO `system_config` (`id`, `name`, `value`, `order_sn`, `memo`) VALUES (5, 'SMS_API_SECRET', 'A7PKI9GKF0UYX5AV1D9QDFX697LFELV2', 5, 'CoolSms Api Secret');
