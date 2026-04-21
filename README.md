# hackAstone

Cognitive Arena（认知竞技场）项目仓库，包含前后端与多 Agent 接入。

## 项目结构

- `hackAstone_web`：React + TypeScript + Vite 前端
- `hackAstone_backend`：Spring Boot + MyBatis 后端
- `hackAstone_app`：SwiftUI 原生客户端（iOS / 可选 macOS），与 Web 端能力对齐

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

## iOS 应用（`hackAstone_app`）

SwiftUI 实现的 Cognitive Arena 客户端，路由与交互与 `hackAstone_web` 对齐：首页世界地图与时代轴、哲学辩论、学科辩论与对局、圆桌辩论、思维画像等。目录拉取失败时会回退到内置 `fallback_catalog.json`，不阻塞使用。

### 环境与工程

- Xcode（建议当前稳定版）与 iOS 模拟器或真机
- 工程路径：`hackAstone_app/hackAstone_app.xcodeproj`，Scheme：`hackAstone_app`
- 额外 plist：`hackAstone_app/AppInfo.plist`（如本地开发需访问 `http://127.0.0.1` 等，已配置 ATS 本地网络相关项；工程内 `INFOPLIST_FILE` 指向该文件）

### 在 Xcode 中运行

1. 先按上文启动后端（默认 `http://localhost:8080/api`）。
2. 用 Xcode 打开 `hackAstone_app/hackAstone_app.xcodeproj`，选择模拟器或设备，运行 `hackAstone_app`。
3. 若哲学家头像走 Vite 静态目录，可启动前端 dev（`8081`），便于加载 `/public/philosophers/*.jpg`。

### 命令行构建示例

```bash
cd hackAstone_app
xcodebuild -scheme hackAstone_app -destination 'platform=iOS Simulator,name=iPhone 17' build
```

（具体模拟器名称以本机 `xcodebuild -showdestinations` 为准。）

### 与后端的连接（开发者）

默认 API 根地址与 Web 的 `VITE_API_BASE_URL` 一致，代码见 `hackAstone_app/hackAstone_app/ArenaConfiguration.swift`：默认 `http://127.0.0.1:8080/api`（无末尾斜杠）。可通过 `UserDefaults` 键 `arena_api_base_url` / `arena_assets_base_url` 覆盖（应用内设置页不向终端用户暴露该配置）。

### 内置资源与本地化

- `hackAstone_app/hackAstone_app/Resources/ne_110m_land.json`：首页地图陆地轮廓
- `hackAstone_app/hackAstone_app/Resources/fallback_catalog.json`：目录离线兜底
- `AppLocaleStore` + `ArenaL10n`：应用内「简体中文 / English」界面文案；设置中切换语言后立即作用于各页标题与按钮等（后端返回的长文本仍可能为中文）

### 主要源码入口

- `hackAstone_app/hackAstone_app/hackAstone_appApp.swift`：应用入口
- `hackAstone_app/hackAstone_app/RootView.swift`：导航栈与路由
- `hackAstone_app/hackAstone_app/HomeView.swift`：首页（哲学 / 学科切换、地图区块）
- `hackAstone_app/hackAstone_app/ArenaAPI.swift`：调用后端 `/api/arena/...` 等接口

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
