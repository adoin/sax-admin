# Sax Admin

- Vue 3 SFC 使用 `<script setup lang="ts">`。
- 业务页面优先使用 Sax Design Vue 的配置式 Table/Form，不创建 `useTable`、`useForm` 等业务包装。
- Table 查询、工具栏、分页和远程请求直接通过 `SaxGridSetting<Row, Query>` 配置。
- 组件库之外的布局和样式使用 UnoCSS；浮层使用组件库 Dialog/Popper。
- 能使用 Sax Design Vue 组件时优先使用，尤其卡片表面直接使用 SCard；不得再用自定义 panel 重建卡片。示例需要中英双语、可操作的业务场景。
- 左侧导航使用 SMenu 配置式 options，不手写菜单节点。菜单管理通过 Alova 调用 Mock CRUD API；持久化归 Mock 后端所有，保存后刷新菜单状态并同步导航与页面搜索。
- API 方法集中在 `src/api`，输入 DTO、返回 DTO 和列表泛型完整透传；不可用 `any` 隐藏类型错误。
- 路由使用 vue-smart-router；vue-router 使用 npm alias 保证组件库与应用共享同一个路由运行时。
- 开发端口固定 7869，strictPort 开启。
- 支持 zh-CN/en-US 双语。页面和无障碍文案使用类型化 t()，中英词条必须一致。语言变化不改变业务标识或清空表单；SConfigProvider 语言包同步切换。
- MockJS 只用于演示，真实认证、授权和持久化由服务器完成。
- 直接在 main 工作。交付前运行 `pnpm typecheck`、`pnpm test`、`pnpm build`，并验证浏览器主要操作。
