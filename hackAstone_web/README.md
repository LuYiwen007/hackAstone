# Cognitive Arena（认知竞技场）· 前端

## 技术栈

- React 19
- TypeScript
- Vite 7
- React Router 7
- Tailwind CSS v4

## 本地运行

```bash
npm install
npm run dev
```

- 默认地址：`http://localhost:8081`
- 代理：`/api -> http://localhost:8080`

## 路由

- `/`：首页（时间轴 + 区域 + 思想家）
- `/disciplines`：学科辩论列表
- `/battle/:id`：学科辩论详情
- `/philosophy-battle/:id`：哲学辩论（多轮 Agent）
- `/roundtable`：多思想家圆桌辩论（Agent）
- `/profile`：思维画像

## 与后端接口对齐

前端 API 封装文件：`src/shared/api/arena.ts`

已用接口：

- `GET /api/arena/catalog`
- `GET /api/arena/profile`
- `POST /api/arena/agent/run`
- `POST /api/arena/agent/topic`
- `POST /api/arena/agent/roundtable/openings`
- `POST /api/arena/agent/roundtable/reply`

## Agent 驱动页面说明

### `PhilosophyBattleLive`

文件：`src/app/pages/PhilosophyBattleLive.tsx`

- 首屏辩题由 Agent 生成
- 支持多轮用户输入
- 每轮包含哲学家回应 + 裁判追问
- 何时收束由 Agent 决定（`continueDebate`）
- 失败自动回退本地文案，避免白屏

### `RoundtableDebate`

文件：`src/app/pages/RoundtableDebate.tsx`

- 开场发言优先走 Agent
- 用户每次输入后，参与思想家批量响应
- 失败自动回退本地模板

## 构建

```bash
npm run build
```

输出目录：`dist/`

## 常见问题

### 白屏 + `504 (Outdated Optimize Dep)`

```bash
rm -rf node_modules/.vite
npm run dev
```

或：

```bash
npm run dev:force
```
