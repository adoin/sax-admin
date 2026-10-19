---
status: active
kind: project-specification
updated_at: 2026-10-19
modules:
  - src/layouts/AdminLayout.vue
  - src/stores/workspace.ts
  - src/components/common/WorkspaceTabs.vue
supersedes: []
---

# Admin 路由页面固定为窗口

## 项目目标

让已打开的多个路由页面可以固定成可移动、可缩放、可重命名的窗口，并可恢复普通路由页面，同时保留原页面内容和输入状态。

## 用户原始需求

> 我还想做一个功能，比如admin中的tabs下面是具体的路由中的页面，我想pin起来其中的n个页面作为可以随意拖动改变位置和大小（有最小阈值）的窗口，并且保持原内容和输入状态，还可以重命名窗口，并且有按键可以让它恢复成普通的路由页面。
> 你觉得这个需求哪些部分放在组件中做合适，哪些部分放在admin中合适呢

## 需求解释与验收标准

- 同时支持多个独立的页面窗口，各自移动、调整大小、重命名和恢复。
- 缩放窗口时执行最小尺寸阈值。
- 页面中的输入和内容在固定、移动、调整大小、重命名和恢复过程中保持不变。
- 窗口操作、页面缓存和路由上下文需要协同，不能使一个窗口误用其他页面的数据或参数。
- 保持既有关闭标签释放对应缓存、刷新标签产生新 revision、最后一个普通标签关闭进入 `/launchpad` 的契约；固定或恢复的生命周期应与真正关闭、刷新明确区分。
- 验证带路由参数和 query 的页面、有本地表单输入的页面，以及多窗口和主区域同时存在的场景。
- 页面与无障碍文案继续支持 zh-CN/en-US；窗口尺寸变化应允许内部 Table、虚拟列表和图表按容器重新布局。

## 与组件库的协同

- 跨仓库功能需求见相邻组件库仓库 `.agents/notes/active/window-and-pinned-route-pages.md`。
- 通用 `SWindow`、稳定 `WorkspacePageHost`、保留固定 Tab、恢复后沿用窗口别名等是讨论中的建议，见组件库 `.agents/notes/proposed/window-component-and-admin-boundary.md`，不属于已逐项确认的用户要求。
- 通用 UI 与路由业务的最终边界、页面内导航策略及标题行为应在设计阶段厘清。

## 架构源码地图

- `src/layouts/AdminLayout.vue` 使用 vue-smart-router 的 RouterView 与 KeepAlive；页面滚动由既有 SScrollbar 承担。
- `src/stores/workspace.ts` 以 fullPath 与 revision 组成缓存名称；关闭移除对应 Tab，刷新增加 revision。
- `src/components/common/WorkspaceTabs.vue` 承担页面标签交互。

## 尚待完成的项目目标

- 实现多页面窗口化、重命名和恢复普通路由页面。
- 建立可验证的页面状态保持与路由上下文隔离方案。
- 完成边界、最小尺寸、多窗口、布局变化、双语和键盘交互验证。
