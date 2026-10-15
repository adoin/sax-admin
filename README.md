# Sax Admin

基于 Sax Design Vue 的 Vue 3 后台管理模板。TypeScript + `<script setup>`，配置驱动业务页面。

## 开始

需要 Node.js 22.12+ 和 pnpm 10.26+（本项目锁定 pnpm 12.3.4）。

```sh
pnpm install
pnpm dev
```

打开 http://localhost:7869 。管理员 `admin / 123456`，只读访客 `viewer / 123456`。

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

## 功能

- 登录、会话恢复、路由守卫、只读角色、404。
- 工作台：指标、收入趋势、访问来源、团队动态。
- 用户管理：配置式查询/表格/分页、成员创建与编辑、删除确认、CSV 导出。
- 订单管理：配置式远程筛选和分页、订单商品明细、履约 Steps。
- 项目空间：MockJS 项目数据、选择/收藏卡片、成员头像、进度和项目详情。
- 表单示例：配置式资料编辑与预览、带校验的分步申请、本地 PDF/图片附件选择。
- 组件示例：23 个示例块，涵盖基础控件、输入控件、状态反馈，以及 9 个 Card 预设/扩展示例。
- ChartGPU：20,000 点演示，折线/柱状/散点，尺寸适配与资源释放。
- deck.gl：离线 Natural Earth 底图、城市散点/标签/流向、拾取提示、平移/缩放/复位。
- 响应式布局、移动导航、页面搜索、通知入口、深色模式。
- 中文 / English 双语：登录页和顶部导航可切换，偏好自动保存；页面、表格/表单配置、校验、组件库语言包、地图标签、CSV 表头和接口错误一起切换。

## 目录与配置式开发

### 扩展业务与特色页面

| 页面 | 路径 | 可操作能力 |
| --- | --- | --- |
| 角色权限 | `/roles` | 中英名称、权限多选、查询与持久化 CRUD |
| 部门组织 | `/departments` | 树形组织、上下级选择、负责人维护、循环关系校验 |
| 字典配置 | `/dictionaries` | 字典分组和值、启停、编码唯一性与 CRUD |
| 操作日志 | `/audit` | 筛选、CSV 导出、真实 Mock 配置变更事件 |
| 表格编辑与查找 | `/table-lab` | 单元格编辑、撤销重做、查找替换、列配置、虚拟滚动 |
| 卡片实验室 | `/card-lab` | 九种预设、液态玻璃材质、光效、方向、形状、加载和选中态 |
| Agent 工作台 | `/agent` | Mock 流式回复、停止、重生成、编辑、反馈、本地附件 |
| 虚拟工作台 | `/virtual` | 十万条生成式记录、动态行高、索引跳转、分栏调整 |
| 文件中心 | `/files` | SImagePreview、SUpload 队列、Promise 选择和水印 |

业务接口集中在 `src/api/admin.ts`，资源键与返回 DTO 通过泛型映射保留具体类型。Mock 后端以 localStorage 持久化角色、部门、字典与日志，写入要求管理员身份；部门不允许循环或删除仍有下级的节点，资源编码保持唯一。新增预置页面会增量加入保存的菜单目录，既有编辑与删除记录保留。角色权限配置不改变演示登录账号的固定权限。

Agent 使用 `/api/assistant/reply` 的模拟文本响应，由页面按段展示；没有外部模型连接，附件只使用文件名，不传输内容。表格编辑与查找和虚拟工作台数据保留在当前标签实例中；虚拟工作台按索引读取记录，未创建十万条完整数组。文件示例只操作本地队列，没有网络上传。

左侧导航使用 `SMenu` 的配置式 `options`、选中项、分组与折叠菜单能力。“菜单管理”通过 Alova 请求 `GET/POST /api/menus` 和 `PUT/DELETE /api/menus/:id`，支持中英文名称、分组层级、目标页面、图标、排序与显示状态。Mock 后端独占配置存储，使用 localStorage 持久化并校验分组循环、父节点、目标页面和写入权限；页面与 Pinia 仅通过 API 读取和保存。保存后立即重新加载菜单并更新侧栏。菜单隐藏只控制导航展示，路由认证仍由原有守卫负责。

“图标示例”页面使用 `SIcon` 和 `sax-design-vue-iconify`。`sax-icons.config.ts` 配置本地 Lucide 集合与动态图标 safelist，Vite 在构建阶段提取单个 SVG，集合 JSON 不进入客户端。运行时自定义图标在 `src/icons/runtime-brand.ts` 注册；注册表不是响应式的，演示在注册后重新挂载图标。`scripts/icon-build-audit.ts` 在生产构建中验证静态/白名单图标存在、未使用的显式导入被树摇移除、完整 JSON 没有打包，输出 `dist/icon-build-report.json`，验证失败将中断构建。

应用外壳使用 `SLayout` 的 `header`、`aside`、`aside-outside`、默认内容插槽，保留组件自带的圆角和柔和阴影，以 12px 外壳留白和区域间距建立无装饰边框的层次。设置入口、语言切换和 `SSwitch` 主题开关位于 Aside 外置底部工具区，展开/收起使用组件自带控件；侧栏菜单与页面内容分别使用 `SScrollbar`；左侧导航、页头与独立胶囊标签栏保持固定，仅内容超出时滚动，切换标签恢复对应的内容滚动位置。应用仅补充全屏尺寸与移动端导航抽屉的布局适配。全局不提供 Footer，仅在需要的页面内部添加局部页脚。

后台使用多标签工作区：菜单访问自动打开标签，工作台固定保留，支持关闭、刷新当前页、关闭其他和关闭全部。`STabs` 提供标签交互，Pinia 管理打开的完整路径；`RouterView.cacheComponentName` 根据路径和刷新版本生成独立缓存名，`KeepAlive.include` 与未关闭的标签同步。切换页面保留查询和表单状态，关闭标签释放对应实例；退出登录清空工作区。缓存只保留在当前浏览器会话的运行内存中，整页刷新后重新初始化。

偏好设置提供线条、胶囊、卡片、可编辑卡片四种标签样式与尺寸选择，立即应用并保存在本地；默认采用小尺寸可编辑卡片。标签超出收纳固定开启 `overflow="collapse"`，隐藏标签可通过“更多标签页”菜单切换，各种样式都保留关闭功能。

标签右键菜单使用 `SContextMenu`，提供刷新、关闭当前、关闭左侧、关闭右侧、关闭其他与关闭全部。所有页面（包括工作台）都可关闭。最后一个标签关闭后进入不占标签的 `/launchpad`，展示空白工作区与已配置菜单的快捷入口；空白页不会自动重新打开工作台。没有可关闭标签的菜单项禁用。键盘聚焦标签后可按 Shift+F10 打开菜单。

“多标签独立编辑”展示 `router.addRoute('admin', ...)` / `removeRoute()`：同一个 `/drafts/:id` 页面可多开为独立草稿，输入内容后切换标签验证状态隔离。移除编辑路由时关闭对应标签并释放缓存，再注册即可重新打开。图表重新激活时恢复尺寸，关闭标签时释放 ChartGPU / deck.gl 实例。

虚拟列表的分栏容器与列表根节点在首次渲染时就使用明确的内联高度约束，避免按需工具样式尚未生效时，百分比视口被列表总高度撑开。开发时可访问 `/tests/fixtures/virtual-height.html` 查看 300 条数据的小规模复现：未约束高度时会渲染全部行，点击切换到明确高度后仅渲染可见行。这个诊断文件不在生产入口中。

卡片表面直接使用 `SCard`，控件优先使用组件库组件。应用仅为 Card 设置填满布局列的宽度；不再通过自定义 `panel` 重建背景、圆角和阴影。深色变量已包含在组件库默认 CSS 中，切换 `html.dark` 即可生效。预算字段使用 Form 插槽中的 `SInputNumber`，因为内置 renderer 注册表暂无数值输入 renderer。

```text
src/api/               Alova 客户端、接口方法、DTO、MockJS 数据
src/stores/            Pinia 会话与偏好
src/i18n/              vue-i18n、中英词条、类型化 t、数据标签翻译
src/router/            vue-smart-router 路由与菜单
src/layouts/           后台外壳
src/pages/             路由页面
src/features/users/    用户配置、业务容器、编辑表单
src/components/        工作台、图表、地图等展示组件
public/geo/            本地地理底图
tests/                 Mock/API 与类型契约验证
```

用户管理的 `config.ts` 返回 `SaxGridSetting<User, UserFilters>`。`STable` 直接接收 `columns`、`queryConfig`、`toolbarConfig`、`pagerConfig`、`proxyConfig`。表单直接用 `FormItemConfig<UserInput>[]` 和内置 `$input` / `$select` renderer。页面显式调用 `usersApi.create()` 等方法，不引入业务 `useXxx` 包装层。

语言支持 `zh-CN` / `en-US`，默认中文，`sax-locale` 保存偏好。`src/i18n/messages.ts` 中英文具有相同类型键；`t()` 只接受已有词条。表格与表单配置以 `computed` 响应语言变化，查询模型保持独立，不因语言切换清空输入。部门、城市和指标使用稳定标识，由展示层翻译；姓名等真实业务数据保持原值。请求通过 `Accept-Language` 传递语言，生产接口应据此返回错误文案。

Alova 的 `Get<PageResult<User>>` / `Post<User>` 保留方法实例、取消请求和 Promise 返回类型，调用方 `await usersApi.list(query)` 自动推断 `PageResult<User>`。请求统一解析 `{ code, message, data }`，HTTP/业务错误抛出 `ApiError`，401 清理会话。Table 的取消信号转发到 Alova。

`vue-router` npm alias 指向 `vue-smart-router`，Vite 同步别名，避免组件库内部路由与应用路由出现两份注入上下文。

## 接入真实接口

订单示例额外使用 `GET /orders`，参数为 `keyword/status/page/pageSize`，返回 `PageResult<Order>`；订单状态为 `pending/paid/shipped/completed`。项目收藏、资料编辑和分步申请当前是页面本地演示；附件选择不执行网络上传。

复制 `.env.example` 为 `.env.local`：

```dotenv
VITE_MOCK_ENABLED=false
VITE_API_BASE_URL=https://your-api.example.com/api
```

服务端需实现：`POST /auth/login`、`GET /dashboard`、`GET /analytics`、`GET /map`、`GET/POST /users`、`PUT/DELETE /users/:id`。响应 DTO 见 `src/api/contracts.ts`。列表参数：`keyword/status/page/pageSize`。请求携带 `Authorization: Bearer <token>`。跨域部署需要服务端允许来源。

Mock 通过 Alova Fetch adapter 的 `customFetch` 接入，不拦截全局 XHR/Fetch。MockJS 生成数据并模拟延迟，支持筛选、分页、写入、重复邮箱/无效资料校验以及访客写入拒绝。Mock 成员变更仅保存在内存，刷新后重置；演示会话存储在 sessionStorage，主题偏好存储在 localStorage。正式项目请将服务端授权作为安全边界，并根据部署需求选择 HttpOnly Cookie 或安全令牌策略。

## 可视化

[ChartGPU](https://chartgpu.io/) 需要 WebGPU 和硬件加速；不可用时明确显示 SVG 趋势预览，SVG 不模拟 GPU 图表交互。图表卸载释放资源，过期初始化结果不会覆盖新实例。

[deck.gl](https://deck.gl/) 需要 WebGL2。底图使用 [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/) 1:110m 国家数据（公共领域），源文件来自 [natural-earth-vector](https://github.com/nvkelso/natural-earth-vector)。地理数据仅用于可视化演示，不用于边界判定。无需地图服务密钥或在线瓦片。地图失败时仍可查看城市排行。

组件库通过 npm `sax-design-vue@2.1.1` 安装，模板不依赖相邻源码目录，可独立克隆和构建。
