# hackAstone

认知竞技场（Cognitive Arena）项目仓库，包含 React 前端与 Spring Boot 后端。

## 项目结构

- `hackAstone_web`：React + TypeScript + Vite 前端
- `hackAstone_backend`：Spring Boot + MyBatis 后端

## 当前功能

- 世界地图哲学家浏览
- 哲学辩论
- 圆桌辩论
- 思维画像
- 通过后端代理接入百炼应用：Atlas / Nova / Forge / Ledger / Echo / Sentinel

## 运行环境

- Node.js 18+
- npm 9+
- JDK 11+
- Maven 3.6+
- MySQL 8+

## 启动后端

```bash
cd hackAstone_backend
mvn spring-boot:run
```

- 后端端口默认是 `8080`
- 接口前缀默认是 `/api`
- 本地接口地址默认是 `http://localhost:8080/api`

## 启动前端

```bash
cd hackAstone_web
npm install
npm run dev
```

- 前端端口默认是 `8081`
- Vite 已经代理 `/api -> http://localhost:8080`
- 本地开发通常不需要额外配置前端环境变量

如果你在非本地代理环境下运行前端，需要手动指定后端地址，可以自行添加：

```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

## 后端 `.env` 配置说明

后端已经支持自动读取本地 `.env` 文件。

相关文件：

- 实际本地配置：`hackAstone_backend/.env`
- 示例文件：`hackAstone_backend/.env.example`
- Spring 配置入口：`hackAstone_backend/src/main/resources/application.yml`

使用步骤：

1. 进入 `hackAstone_backend`
2. 复制 `.env.example` 为 `.env`
3. 按你本地环境填写数据库和 AI 配置
4. 再启动后端

示例：

```bash
cd hackAstone_backend
copy .env.example .env
```

`.env` 示例内容：

```properties
# Server
SERVER_PORT=8080
SERVER_CONTEXT_PATH=/api
APP_LOG_LEVEL=debug

# Database
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/hackastone?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=123456

# Bailian / DashScope
BAILIAN_API_KEY=你的百炼 Key
BAILIAN_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/apps
BAILIAN_TIMEOUT_MS=60000
BAILIAN_CACHE_TTL_MS=60000
BAILIAN_ATLAS_APP_ID=
BAILIAN_NOVA_APP_ID=
BAILIAN_FORGE_APP_ID=
BAILIAN_LEDGER_APP_ID=
BAILIAN_ECHO_APP_ID=你的 Echo 应用 ID
BAILIAN_SENTINEL_APP_ID=
```

说明：

- `hackAstone_backend/.env` 已加入 `.gitignore`，不会被提交
- `.env.example` 现在补全了后端实际会读取的字段：服务、数据库、百炼配置
- `BAILIAN_API_KEY` 是所有 AI 请求的必填项
- 当前哲学辩题生成、圆桌开场、圆桌回复主要依赖 `BAILIAN_ECHO_APP_ID`
- 其他 `BAILIAN_*_APP_ID` 只有在调用对应 agent 时才需要填写

## AI 调用链路

前端请求入口：

- `hackAstone_web/src/shared/api/arena.ts`

后端接口入口：

- `hackAstone_backend/src/main/java/org/hackastone/controller/ArenaController.java`

真正调用外部 AI API：

- `hackAstone_backend/src/main/java/org/hackastone/biz/BailianAgentService.java`

主要接口：

- `POST /api/arena/agent/run`
- `POST /api/arena/agent/topic`
- `POST /api/arena/agent/roundtable/openings`
- `POST /api/arena/agent/roundtable/reply`

## 前端路由

- `/`：首页地图
- `/philosophy-battle/:id`：哲学辩论
- `/roundtable`：圆桌辩论
- `/disciplines`：学科页
- `/battle/:id`：学科对战详情
- `/profile`：思维画像

## 常见问题

### `vite` 找不到

重新安装前端依赖：

```bash
cd hackAstone_web
npm install
```

### 白屏或 `Outdated Optimize Dep`

```bash
cd hackAstone_web
npm run dev:force
```

### Git 误跟踪构建产物

这些目录不应该提交到仓库：

- `hackAstone_web/node_modules`
- `hackAstone_web/dist`
- `hackAstone_web/.npm-cache`
- `hackAstone_backend/target`
- `.codex-runlogs`
- `.idea`
- `.vscode`

## 备注

- 敏感信息请放在本地 `.env` 或系统环境变量里
- 不要提交 `node_modules`、`dist`、`target`、日志文件和本地 IDE 配置
