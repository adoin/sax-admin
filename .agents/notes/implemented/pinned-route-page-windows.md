---
status: implemented
completed_at: 2026-10-19
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

- 跨仓库功能需求见相邻组件库仓库 `.agents/notes/implemented/window-and-pinned-route-pages.md`。
- 通用 `SWindow`、稳定 `WorkspacePageHost`、保留固定 Tab、恢复后沿用窗口别名等是讨论中的建议，见组件库 `.agents/notes/proposed/window-component-and-admin-boundary.md`，不属于已逐项确认的用户要求。
- 通用 UI 与路由业务的最终边界、页面内导航策略及标题行为应在设计阶段厘清。

## 架构源码地图

- `src/layouts/AdminLayout.vue` 使用 vue-smart-router 的 RouterView 与 KeepAlive；页面滚动由既有 SScrollbar 承担。
- `src/stores/workspace.ts` 以 fullPath 与 revision 组成缓存名称；关闭移除对应 Tab，刷新增加 revision。
- `src/components/common/WorkspaceTabs.vue` 承担页面标签交互。

## 已完成的项目目标

- 实现多页面窗口化、重命名和恢复普通路由页面。
- 建立可验证的页面状态保持与路由上下文隔离方案。
- 完成边界、最小尺寸、多窗口、布局变化、双语和键盘交互验证。

## 实现与已通过验证

- WorkspacePages 组合稳定的 WorkspacePageHost；每个 fullPath::revision 仅有一个页面承载树，固定/恢复仅改变 Teleport 目标及 RouterView detached 状态。
- 布局作用域内的 page-windows 管理器保存 pinned、别名、rect、激活层级和聚焦请求，不改变全局 route.meta，不持久化输入或布局。
- 固定 Tab 保留并显示标记；点击或普通导航到固定页面聚焦现有窗口。恢复先成功导航再移回主区域；被守卫阻止时继续保留窗口。
- 保留原生输入、选择与滚动；新视口无法保留原滚动偏移时按可滚动边界夹取。关闭释放对应宿主和元数据；刷新只变更该 Tab 的 revision。最后一个普通 Tab 关闭进入 launchpad，固定窗口继续存在。
- 内部浮层仍由既有 Popper/Dialog 处理。窗口滚动条在内容边缘留出空间，与缩放手柄分离。
- useRemainingHeight 按实际窗口容器测量；筛选、工具栏、分页换行时，根据实际非数据区域保留至少 160px 的 Table 数据视图（含表头），通过外层页面滚动承载剩余内容。
- 使用公开 sax-design-vue 2.4.2、vue-smart-router 5.4.1，vue-router alias 指向同一版本，Iconify 保持 1.0.2。
- 34 项测试、类型检查、生产构建通过。IAB 生产预览验证多个独立输入、同一原生输入 ID、params/query、重命名/恢复、聚焦、刷新/关闭、launchpad、双语和浅/深色。
- Table 缩到最小窗口仍有数据视图；十万条虚拟列表缩放后仍只渲染少量行；WebGPU 就绪，三层 Canvas 的 CSS 宽度随容器从 657px 更新为 397px。
## 窗口层叠边界

- 普通页面宿主（含 tabless）使用 relative + z-index: 0 建立层叠上下文，将吸顶导航等页面内部层级限制在窗口下方；窗口保持既有激活排序，Teleport 页面树不变。
- 已复验图标页吸顶导航 z-index: 12 与工单窗口 z-index: 7 重叠时，elementFromPoint 命中窗口内部；34 项测试、类型检查、生产构建通过。

## 标签固定入口

- 标签通过 label-extra 提供独立 Pin 按钮，避免嵌套在原生标签按钮内。未固定时 hover/focus-within 显示，已固定常显实心 Pin，触屏始终显示；点击切换固定/恢复并阻止触发标签选择。右键入口保留，移除工具栏重复 Pin。
- 窗口恢复按钮使用 PanelsTopLeft 图标及本地化提示。浏览器验证键盘 Tab/Enter 固定、点击恢复、同一原生输入 ID 保留；34 项测试、类型检查、生产构建通过。
