# hackAstone

Cognitive Arena（认知竞技场）项目仓库，包含前后端与多 Agent 接入。

## 项目结构

- `hackAstone_web`：React + TypeScript + Vite 前端
- `hackAstone_backend`：Spring Boot + MyBatis 后端

## 当前功能

- 思想家地图、哲学辩论、学科辩论
- 多思想家圆桌辩论
- 思维画像
- 通过后端代理接入阿里云百炼应用（Atlas / Nova / Forge / Ledger / Echo / Sentinel）

## 运行环境

- Node.js 18+
- npm 9+
- JDK 11+
- Maven 3.6+
- MySQL 8+

## 启动方式

### 1) 启动后端

```bash
cd hackAstone_backend
mvn spring-boot:run
```

- 后端端口：`8080`
- 接口前缀：`/api`
- 基础地址：`http://localhost:8080/api`

### 2) 启动前端

```bash
cd hackAstone_web
npm install
npm run dev
```

- 前端端口：`8081`
- Vite 代理：`/api -> http://localhost:8080`

## 百炼 Agent 接入说明

后端配置文件：`hackAstone_backend/src/main/resources/application.yml`

关键配置项：

- `bailian.api-key`
- `bailian.endpoint`
- `bailian.atlas-app-id`
- `bailian.nova-app-id`
- `bailian.forge-app-id`
- `bailian.ledger-app-id`
- `bailian.echo-app-id`
- `bailian.sentinel-app-id`
- `bailian.timeout-ms`（超时控制）
- `bailian.cache-ttl-ms`（短期缓存，提速）

后端主要 Agent 接口：

- `POST /api/arena/agent/run`
- `POST /api/arena/agent/topic`
- `POST /api/arena/agent/roundtable/openings`
- `POST /api/arena/agent/roundtable/reply`

## 前端路由（当前）

- `/`：首页地图
- `/philosophy-battle/:id`：哲学辩论（多轮、Agent 驱动）
- `/roundtable`：圆桌辩论（Agent 驱动）
- `/disciplines`：学科辩论
- `/battle/:id`：学科对战详情
- `/profile`：思维画像

## 常见问题

### 1) 白屏 + `Outdated Optimize Dep`

```bash
cd hackAstone_web
rm -rf node_modules/.vite
npm run dev
```

或：

```bash
npm run dev:force
```

### 2) PR 冲突在 `node_modules/.vite`

`node_modules` 不应纳入版本控制，若历史已跟踪：

```bash
git rm -r --cached hackAstone_web/node_modules
git commit -m "chore: remove node_modules from git tracking"
```

## 备注

- 生产环境建议用环境变量管理敏感信息。
- `node_modules/`、`.vite/`、`target/` 属于构建产物，不建议提交。
