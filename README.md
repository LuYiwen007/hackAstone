# hackAstone

hackAstone比赛仓库


## 项目简介

本项目是一个基于 Spring Boot + React 的计划管理应用，采用分层架构设计，支持用户账户管理、计划创建与管理、使用数据统计，并集成 AI 大模型实现智能计划生成功能。

## 技术栈

### 前端
- **框架**: React 19
- **构建工具**: Vite 7.2.4
- **路由**: React Router 6.30.2
- **状态管理**: Zustand 5.0.9
- **架构**: Feature-Sliced Design (FSD)
- **AI集成**: 前端直接调用大模型 API（OpenAI/Claude等）

### 后端
- **框架**: Spring Boot 2.1.0
- **数据库**: MySQL 8.0.21
- **缓存**: Redis（用于 Session 存储）
- **ORM**: MyBatis
- **连接池**: HikariCP
- **日志**: Log4j2

## 项目目录结构

### 前端项目（hackAstone_web）

hackAstone_web/
├── package.json # npm 包配置文件
├── vite.config.js # Vite 构建工具配置
├── index.html # HTML 入口文件
├── eslint.config.js # ESLint 配置
├── README.md # 项目说明文档
│
├── public/ # 公共静态资源
│ └── favicon.ico
│
└── src/
├── main.jsx # React 应用入口
├── App.jsx # 应用根组件
├── App.css # 全局样式
├── index.css # 基础样式
│
├── app/ # 应用层（FSD: App）
│ ├── App.jsx # 应用根组件
│ ├── index.jsx # 应用入口导出
│ └── router/ # 路由配置
│ ├── index.js # 路由适配器入口
│ ├── routes.js # 路由定义
│ └── web.jsx # Web 路由实现（React Router）
│
├── pages/ # 页面层（FSD: Pages）
│ ├── LoginPage/ # 登录页面
│ │ ├── LoginPage.jsx
│ │ └── index.js
│ ├── RegisterPage/ # 注册页面
│ │ ├── RegisterPage.jsx
│ │ └── index.js
│ ├── PlanListPage/ # 计划列表页面
│ │ ├── PlanListPage.jsx
│ │ └── index.js
│ ├── PlanDetailPage/ # 计划详情页面
│ │ ├── PlanDetailPage.jsx
│ │ └── index.js
│ ├── CreatePlanPage/ # 创建计划页面
│ │ ├── CreatePlanPage.jsx
│ │ └── index.js
│ ├── AIChatPage/ # AI对话生成计划页面
│ │ ├── AIChatPage.jsx
│ │ └── index.js
│ └── UsageDataPage/ # 使用数据统计页面
│ ├── UsageDataPage.jsx
│ └── index.js
│
├── components/ # 功能层（FSD: Features）
│ ├── auth/ # 认证功能模块
│ │ ├── hooks/
│ │ │ ├── useAuth.js
│ │ │ └── useLogin.js
│ │ ├── ui/
│ │ │ ├── LoginForm.jsx
│ │ │ └── RegisterForm.jsx
│ │ └── index.js
│ ├── plan/ # 计划功能模块
│ │ ├── hooks/
│ │ │ ├── usePlanList.js
│ │ │ ├── useCreatePlan.js
│ │ │ └── useUpdatePlan.js
│ │ ├── ui/
│ │ │ ├── PlanCard.jsx
│ │ │ ├── PlanList.jsx
│ │ │ ├── PlanForm.jsx
│ │ │ └── PlanStatusBadge.jsx
│ │ └── index.js
│ ├── ai/ # AI功能模块
│ │ ├── hooks/
│ │ │ ├── useAIChat.js # AI对话Hook（调用大模型API）
│ │ │ ├── useAIGeneratePlan.js # AI生成计划Hook
│ │ │ └── useSaveConversation.js # 保存对话Hook
│ │ ├── ui/
│ │ │ ├── AIChatWindow.jsx # AI对话窗口组件
│ │ │ ├── AIChatMessage.jsx # AI对话消息组件
│ │ │ ├── AIChatInput.jsx # AI对话输入组件
│ │ │ └── AIGenerateButton.jsx # AI生成按钮
│ │ └── index.js
│ ├── usage/ # 使用数据功能模块
│ │ ├── hooks/
│ │ │ └── useUsageData.js
│ │ ├── ui/
│ │ │ ├── UsageChart.jsx
│ │ │ └── UsageStats.jsx
│ │ └── index.js
│ └── error/ # 错误处理模块
│ ├── ui/
│ │ └── Error.jsx
│ └── index.js
│
├── entities/ # 实体层（FSD: Entities）
│ ├── user/ # 用户实体
│ │ ├── api/
│ │ │ └── userApi.js
│ │ ├── model/
│ │ │ └── types.js
│ │ ├── store/
│ │ │ └── userStore.js
│ │ └── index.js
│ ├── plan/ # 计划实体
│ │ ├── api/
│ │ │ └── planApi.js
│ │ ├── model/
│ │ │ └── types.js
│ │ ├── store/
│ │ │ └── planStore.js
│ │ └── index.js
│ ├── usage/ # 使用数据实体
│ │ ├── api/
│ │ │ └── usageDataApi.js
│ │ ├── model/
│ │ │ └── types.js
│ │ ├── store/
│ │ │ └── usageDataStore.js
│ │ └── index.js
│ └── ai/ # AI实体
│ ├── api/
│ │ ├── aiClient.js # 大模型API客户端（直接调用OpenAI/Claude等）
│ │ └── conversationApi.js # 对话存储API（调用后端）
│ ├── model/
│ │ └── types.js
│ └── index.js
│
└── shared/ # 共享层（FSD: Shared）
├── api/
│ ├── client.js # 后端API客户端
│ └── endpoints.js # API端点配置
├── constants/
│ ├── config.js # 应用配置（含AI API Key配置）
│ └── routes.js # 路由常量
├── lib/
│ └── platform.js # 平台检测工具
├── ui/ # 基础UI组件（Web专用）
│ ├── Button/
│ │ ├── Button.jsx
│ │ └── index.js
│ ├── Input/
│ │ ├── Input.jsx
│ │ └── index.js
│ ├── Card/
│ │ ├── Card.jsx
│ │ └── index.js
│ ├── Modal/
│ │ ├── Modal.jsx
│ │ └── index.js
│ └── Loading/
│ ├── Loading.jsx
│ └── index.js
└── utils/
├── format.js # 格式化工具
└── date.js # 日期工具

### 后端项目（hackAstone_backend）

hackAstone_backend/
├── src/
│ ├── main/
│ │ ├── java/
│ │ │ └── org/hackastone/
│ │ │ ├── HackAstoneApplication.java # Spring Boot 启动类
│ │ │ │
│ │ │ ├── base/ # 基础层 - 基础设施和通用组件
│ │ │ │ ├── dal/ # 数据访问层 (Data Access Layer)
│ │ │ │ │ ├── entity/ # 数据库实体类（对应数据库表）
│ │ │ │ │ │ ├── UserEntity.java
│ │ │ │ │ │ ├── PlanEntity.java
│ │ │ │ │ │ ├── UsageDataEntity.java
│ │ │ │ │ │ └── AIConversationEntity.java
│ │ │ │ │ └── mapper/ # MyBatis Mapper 接口
│ │ │ │ │ ├── UserMapper.java
│ │ │ │ │ ├── PlanMapper.java
│ │ │ │ │ ├── UsageDataMapper.java
│ │ │ │ │ └── AIConversationMapper.java
│ │ │ │ └── util/ # 基础工具类
│ │ │ │ ├── constants/ # 常量定义
│ │ │ │ │ └── BizConstants.java
│ │ │ │ ├── exception/ # 异常处理
│ │ │ │ │ ├── AssertUtil.java
│ │ │ │ │ └── HackAstoneBizException.java
│ │ │ │ ├── log/ # 日志工具
│ │ │ │ │ └── LogUtil.java
│ │ │ │ ├── template/ # 业务模板（统一异常处理）
│ │ │ │ │ ├── AbstractBizCallback.java
│ │ │ │ │ ├── BizCallback.java
│ │ │ │ │ └── BizTemplate.java
│ │ │ │ └── validator/ # 参数校验
│ │ │ │ └── RequestValidator.java
│ │ │ │
│ │ │ ├── biz/ # 业务层 - 业务逻辑和 DTO
│ │ │ │ └── dto/ # 数据传输对象 (Data Transfer Object)
│ │ │ │ ├── converter/ # DTO 转换器
│ │ │ │ │ ├── UserDTOConverter.java
│ │ │ │ │ ├── PlanDTOConverter.java
│ │ │ │ │ ├── UsageDataDTOConverter.java
│ │ │ │ │ └── AIConversationDTOConverter.java
│ │ │ │ ├── UserDTO.java
│ │ │ │ ├── PlanDTO.java
│ │ │ │ ├── UsageDataDTO.java
│ │ │ │ ├── AIConversationDTO.java
│ │ │ │ ├── LoginRequest.java
│ │ │ │ ├── LoginResponse.java
│ │ │ │ ├── RegisterRequest.java
│ │ │ │ ├── CreatePlanRequest.java
│ │ │ │ ├── UpdatePlanRequest.java
│ │ │ │ ├── SaveConversationRequest.java
│ │ │ │ └── GetConversationRequest.java
│ │ │ │
│ │ │ ├── controller/ # 控制器层 - HTTP 请求处理
│ │ │ │ ├── aspect/ # AOP 切面
│ │ │ │ │ └── LoggingAspect.java
│ │ │ │ ├── config/ # 控制器配置
│ │ │ │ │ └── WebMvcConfig.java
│ │ │ │ ├── interceptor/ # 拦截器
│ │ │ │ │ └── AuthInterceptor.java
│ │ │ │ ├── UserController.java
│ │ │ │ ├── PlanController.java
│ │ │ │ ├── UsageDataController.java
│ │ │ │ │ └── AIConversationController.java
│ │ │ │
│ │ │ └── core/ # 核心层 - 领域模型和核心服务
│ │ │ ├── model/ # 领域模型（富模型）
│ │ │ │ ├── User.java
│ │ │ │ ├── Plan.java
│ │ │ │ ├── UsageData.java
│ │ │ │ ├── AIConversation.java
│ │ │ │ └── UserContext.java
│ │ │ ├── service/ # 领域服务接口和实现
│ │ │ │ ├── UserService.java
│ │ │ │ ├── UserServiceImpl.java
│ │ │ │ ├── PlanService.java
│ │ │ │ ├── PlanServiceImpl.java
│ │ │ │ ├── UsageDataService.java
│ │ │ │ ├── UsageDataServiceImpl.java
│ │ │ │ ├── SessionService.java
│ │ │ │ ├── SessionServiceImpl.java
│ │ │ │ ├── AIConversationService.java
│ │ │ │ └── AIConversationServiceImpl.java
│ │ │ ├── converter/ # 领域模型转换器
│ │ │ │ ├── UserConverter.java
│ │ │ │ ├── PlanConverter.java
│ │ │ │ ├── UsageDataConverter.java
│ │ │ │ └── AIConversationConverter.java
│ │ │ ├── enums/ # 枚举类
│ │ │ │ ├── ResultEnum.java
│ │ │ │ ├── PlanStatus.java # 计划状态枚举（5个状态）
│ │ │ │ ├── PlanType.java
│ │ │ │ ├── UsageDataType.java
│ │ │ │ └── ConversationRole.java # 对话角色枚举
│ │ │ └── util/ # 核心工具类
│ │ │ ├── IdGenerator.java
│ │ │ └── UserContextHolder.java
│ │ │
│ │ └── resources/ # 资源文件
│ │ ├── application.yml # Spring Boot 配置文件
│ │ ├── log4j2-spring.xml # Log4j2 日志配置
│ │ ├── db/ # 数据库相关
│ │ │ ├── schema.sql # 数据库表结构脚本
│ │ │ └── test_data.sql # 测试数据
│ │ ├── mappers/ # MyBatis XML Mapper 文件
│ │ │ ├── UserMapper.xml
│ │ │ ├── PlanMapper.xml
│ │ │ ├── UsageDataMapper.xml
│ │ │ └── AIConversationMapper.xml
│ │ └── static/ # 静态资源（前端文件）
│ │ └── assets/ # 前端资源文件
│ │
│ └── test/ # 测试代码
│ └── java/
│ └── org/hackastone/
│
├── pom.xml # Maven 项目配置文件
└── README.md # 项目说明文档

## 架构说明

### 分层架构

项目采用经典的分层架构设计，各层职责清晰：

1. **Controller 层** (`controller/`)
   - 处理 HTTP 请求和响应
   - 参数校验和结果封装
   - 使用 `BizTemplate` 统一异常处理

2. **Biz 层** (`biz/`)
   - 业务数据传输对象（DTO）
   - DTO 与领域模型的转换

3. **Core 层** (`core/`)
   - 领域模型（Domain Model）
   - 领域服务（Domain Service）
   - 核心业务逻辑实现
   - 枚举和工具类

4. **Base 层** (`base/`)
   - 数据访问层（DAL）
   - 数据库实体类（Entity）
   - MyBatis Mapper 接口
   - 通用工具类和基础设施

### 前端架构（Feature-Sliced Design）

前端采用 FSD 架构，层级清晰：

1. **app** - 应用层：路由、全局配置
2. **pages** - 页面层：完整路由页面
3. **components** - 功能层：业务功能模块
4. **entities** - 实体层：业务实体（API、Model、Store）
5. **shared** - 共享层：基础组件、工具函数、常量

### AI 集成说明

- **AI API 调用**：前端直接调用大模型 API（OpenAI/Claude 等），不经过后端
- **对话存储**：AI 对话内容通过后端 API 存储到 MySQL 数据库
- **计划生成**：用户确认后，AI 生成的计划通过正常创建计划 API 保存，与手动创建的计划统一存储

## 数据库表结构设计

### 1. ID序列号表（id_sequence）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| entity_type | VARCHAR(32) | 实体类型（如：USR, PLN, UDT, AIC等） | PRIMARY KEY |
| current_value | BIGINT | 当前序列号值 | NOT NULL, DEFAULT 0 |
| step | INT | 步长 | NOT NULL, DEFAULT 1 |
| updated_at | DATETIME | 更新时间 | NOT NULL |

**初始化数据：**
INSERT INTO `id_sequence` (`entity_type`, `current_value`, `step`) VALUES
('USR', 0, 1),  -- 用户
('PLN', 0, 1),  -- 计划
('UDT', 0, 1),  -- 使用数据
('AIC', 0, 1);  -- AI对话### 2. 用户账户表（ha_user）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | VARCHAR(64) | 用户ID（主键） | PRIMARY KEY |
| username | VARCHAR(50) | 用户名 | NOT NULL, UNIQUE |
| phone | VARCHAR(20) | 手机号 | UNIQUE |
| password_hash | VARCHAR(255) | 密码哈希 | NOT NULL |
| nickname | VARCHAR(50) | 昵称 | |
| avatar_url | VARCHAR(255) | 头像URL | |
| status | VARCHAR(32) | 状态：ENABLED-正常，DISABLED-禁用，DELETED-删除 | NOT NULL, DEFAULT 'ENABLED' |
| ext_info | MEDIUMTEXT | 扩展信息（JSON格式） | NULL |
| created_at | DATETIME | 创建时间 | NOT NULL |
| updated_at | DATETIME | 更新时间 | NOT NULL |

**索引：**
- `uk_username` (username) UNIQUE
- `uk_phone` (phone) UNIQUE
- `idx_username` (username)
- `idx_phone` (phone)
- `idx_status` (status)

### 3. 计划内容表（ha_plan）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | VARCHAR(64) | 计划ID（主键） | PRIMARY KEY |
| user_id | VARCHAR(64) | 用户ID | NOT NULL |
| title | VARCHAR(200) | 计划标题 | NOT NULL |
| description | TEXT | 计划描述 | |
| plan_type | VARCHAR(50) | 计划类型 | |
| status | VARCHAR(32) | 状态：DRAFT-草稿，PENDING-待开始，IN_PROGRESS-进行中，COMPLETED-已完成，CANCELLED-已取消 | NOT NULL, DEFAULT 'DRAFT' |
| start_date | DATETIME | 开始时间 | |
| end_date | DATETIME | 结束时间 | |
| priority | INT | 优先级：0-低，1-中，2-高 | DEFAULT 0 |
| tags | JSON | 标签（JSON数组） | |
| ext_info | MEDIUMTEXT | 扩展信息（JSON格式） | NULL |
| created_at | DATETIME | 创建时间 | NOT NULL |
| updated_at | DATETIME | 更新时间 | NOT NULL |

**索引：**
- `idx_user_id` (user_id)
- `idx_status` (status)
- `idx_created_at` (created_at)
- `idx_user_status` (user_id, status)

**说明：**
- 计划状态共5个：DRAFT（草稿）、PENDING（待开始）、IN_PROGRESS（进行中）、COMPLETED（已完成）、CANCELLED（已取消）
- AI 生成的计划与手动创建的计划统一存储，不额外标注

### 4. 用户使用数据表（ha_usage_data）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | VARCHAR(64) | 数据ID（主键） | PRIMARY KEY |
| user_id | VARCHAR(64) | 用户ID | NOT NULL |
| plan_id | VARCHAR(64) | 关联计划ID（可选） | NULL |
| data_type | VARCHAR(50) | 数据类型：VIEW_PLAN-查看计划，CREATE_PLAN-创建计划，UPDATE_PLAN-更新计划，COMPLETE_PLAN-完成计划等 | NOT NULL |
| action | VARCHAR(100) | 具体操作 | |
| duration | INT | 使用时长（秒） | |
| metadata | JSON | 额外数据（JSON对象） | |
| created_at | DATETIME | 创建时间 | NOT NULL |

**索引：**
- `idx_user_id` (user_id)
- `idx_plan_id` (plan_id)
- `idx_data_type` (data_type)
- `idx_created_at` (created_at)

### 5. AI对话内容表（ha_ai_conversation）

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | VARCHAR(64) | 对话ID（主键） | PRIMARY KEY |
| user_id | VARCHAR(64) | 用户ID | NOT NULL |
| session_id | VARCHAR(64) | 会话ID（一次对话会话的唯一标识） | NOT NULL |
| role | VARCHAR(20) | 角色：USER-用户，ASSISTANT-AI助手 | NOT NULL |
| content | TEXT | 对话内容 | NOT NULL |
| created_at | DATETIME | 创建时间 | NOT NULL |

**索引：**
- `idx_user_id` (user_id)
- `idx_session_id` (session_id)
- `idx_created_at` (created_at)
- `idx_user_session` (user_id, session_id)

**说明：**
- 存储用户与 AI 的对话内容，包括时间、角色（用户/AI）、内容和会话ID
- 用于记录 AI 生成计划过程中的完整对话历史

## 关联关系说明

1. 用户 → 计划：一对多
2. 用户 → 使用数据：一对多
3. 用户 → AI对话：一对多
4. 计划 → 使用数据：一对多（可选关联）
5. 会话 → AI对话：一对多（通过 session_id 关联）

## 设计要点

1. **ID字段设计**：所有表的ID字段统一使用 VARCHAR(64) 类型，通过 id_sequence 表生成唯一ID，方便未来分库分表扩展
2. **外键设计**：不使用数据库外键约束，所有关联字段通过普通索引实现，便于分库分表和提升性能
3. **软删除设计**：用户表通过 status 字段实现软删除，统一使用 VARCHAR(32) 存储状态值
4. **计划状态**：计划表有5个状态（DRAFT, PENDING, IN_PROGRESS, COMPLETED, CANCELLED），覆盖计划完整生命周期
5. **AI对话存储**：AI对话内容按时间、角色、内容、会话ID存储，支持完整的对话历史追溯
6. **统一存储**：AI生成的计划与手动创建的计划统一存储在 ha_plan 表中，不额外标注来源
7. **索引优化**：为常用查询字段建立索引，提升查询性能
8. **时间戳**：记录创建时间、更新时间，便于审计和排序
