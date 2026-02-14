# HackAstone Web - 前端项目

基于 React 19 + Vite 的计划管理应用前端。

## 技术栈

- **框架**: React 19
- **构建工具**: Vite 7.2.4
- **路由**: React Router 6.30.2
- **状态管理**: Zustand 5.0.9
- **架构**: Feature-Sliced Design (FSD)

## 项目结构

```
hackAstone_web/
├── src/
│   ├── app/              # 应用层（路由配置）
│   ├── pages/             # 页面层
│   ├── components/        # 功能层（业务组件）
│   ├── entities/          # 实体层（API、Store、Model）
│   └── shared/            # 共享层（基础组件、工具）
├── public/                # 静态资源
└── package.json
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

## 构建

```bash
npm run build
```

## 预览构建结果

```bash
npm run preview
```

## 页面说明

- `/` - 计划列表页面
- `/plan/:id` - 计划详情页面
- `/plan/create` - 创建计划页面
- `/ai/chat` - AI对话生成计划页面（仅UI，未接入实际AI）
- `/usage` - 使用数据统计页面

## 注意事项

- 当前版本仅包含UI实现，未接入后端API
- AI功能仅展示UI界面，未接入实际AI API
- 数据使用模拟数据展示

