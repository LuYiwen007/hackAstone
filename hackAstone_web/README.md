# Cognitive Arena（认知竞技场）· 前端

界面与交互**完全沿用**仓库外目录 `网页设计` 中的实现（React + TypeScript + Vite + Tailwind CSS v4 + Radix UI）。

## 运行

```bash
npm install
npm run dev
```

若浏览器白屏且控制台出现 **504 (Outdated Optimize Dep)**：先停掉 dev，删除缓存目录 `node_modules/.vite` 后重新 `npm run dev`；或执行一次 `npm run dev:force`。并确认只开了一个 Vite 进程。

开发服务器默认 <http://localhost:8081>（`vite.config.ts`）。后端 Spring Boot 默认 **8080**，Vite 将 `/api` 代理到 `http://localhost:8080`。

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 首页：时间轴 + 区域 + 思想家卡片，选中后可辩论 |
| `/disciplines` | 学科辩论 |
| `/battle/:id` | 学科对战 |
| `/philosophy-battle/:id` | 与选定思想家哲学辩论 |
| `/roundtable` | 多思想家圆桌辩论 |
| `/profile` | 个人学习档案（My Learning Journey） |

## 功能规划（与产品需求对应）

- **思想家知识卡片 + 深度资料**：`PhilosopherCard` 弹层内已含著作、引言、观点、影响关系；「深度资料」按钮可后续接维基或后端摘要。
- **辩论后智能总结**：`DebateSummary` 组件（辩论流程末尾）。
- **现代应用场景**：`ModernApplication` 组件。
- **概念闪卡**：`ConceptCards` 组件。
- **圆桌 / 档案**：见 `RoundtableDebate.tsx`、`MindProfile.tsx`。

后端对接时可将上述页面的静态/mock 数据替换为 Spring Boot API。

## 构建

```bash
npm run build
```

输出目录：`dist/`。
