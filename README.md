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
- ChartGPU：20,000 点演示，折线/柱状/散点，尺寸适配与资源释放。
- deck.gl：离线 Natural Earth 底图、城市散点/标签/流向、拾取提示、平移/缩放/复位。
- 响应式布局、移动导航、页面搜索、通知入口、深色模式。
- 中文 / English 双语：登录页和顶部导航可切换，偏好自动保存；页面、表格/表单配置、校验、组件库语言包、地图标签、CSV 表头和接口错误一起切换。

## 目录与配置式开发

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

组件库通过 npm `sax-design-vue@2.1.0` 安装，模板不依赖相邻源码目录，可独立克隆和构建。
