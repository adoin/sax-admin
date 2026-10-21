export const iconsZh = {
  "nav.icons": "图标示例",
  "icons.caption":
    "从按名称使用图标，到内网 Docker 部署与完全离线的 SVG 用法。",
  "icons.use": "1. 日常使用：写图标名称即可",
  "icons.useCaption":
    "切换下拉选项可观察图标变形。本项目已全局开启动画，按钮和标签等组件的图标也会继承；局部可用 morph 配置或关闭。",
  "icons.apiTiming":
    "图标服务由开发机或 CI 在开发、构建时访问；上线后的浏览器使用打包的 SVG，不需要连接公网图标服务。",
  "icons.names":
    "demo 和 nav 是本项目的名称前缀，都对应 Lucide 图标集。例如 demo:house 表示 Lucide 的 house 图标。修改尺寸用 size，修改颜色用 color。",
  "icons.rocket": "火箭",
  "icons.verified": "认证",
  "icons.house": "首页",
  "icons.settings": "设置",
  "icons.analytics": "分析",
  "icons.select": "切换图标",
  "icons.brand": "品牌图标",
  "icons.config": "2. 项目配置：API 地址和动态名称",
  "icons.configCaption":
    "配置在项目根目录 sax-icons.config.ts，Vite 已接入 saxIcons 插件。日常页面只需使用 SIcon。",
  "icons.dynamicNote":
    "直接写在模板里的图标名称会自动识别。通过变量、菜单数据或后端返回的名称，要提前列入 safelist；它只是“需要预先准备的图标名称列表”。打包时只带上实际使用或列出的图标，不会带入整个图标集。",
  "icons.menuNote":
    "菜单管理与构建 safelist 共用 menuIcons，选择器使用 api: false，候选 SVG 由 Admin 预打包。增加动态名称后重启开发服务或重新构建；未知名称不会让浏览器自动联网找图标。",
  "icons.privateApi": "3. 内网使用：部署自己的图标服务",
  "icons.privateApiCaption":
    "使用 Iconify 官方镜像 iconify/api。先部署服务，再让开发机和 CI 使用内网地址。",
  "icons.dockerStart":
    "先准备镜像，并将 {package} 的 icons.json 保存为服务器 /srv/iconify/icon-sets/lucide.json，prefix 须为 lucide。以下命令只读本地 JSON，不拉取镜像或远程图标；生产环境请固定验证过的镜像标签或摘要。",
  "icons.dockerImage": "Docker Hub：iconify/api",
  "icons.deployDocs": "官方部署说明",
  "icons.dockerOffline":
    "隔离网络须先在联网机器执行前两行，将镜像 tar 和准备好的 lucide.json 一起带入内网。导入镜像并放好 JSON 后，再运行上面的启动命令；仅导入镜像不足以提供离线图标。",
  "icons.setEndpoint":
    "在 Admin 项目根目录的 .env.local 设置服务地址。将 icons.intranet 换成开发机和 CI 都能访问的服务器地址；远程服务器不能写 localhost。",
  "icons.verifyEndpoint":
    "从开发机或 CI 检查接口能否返回包含 house、settings 的 icons 数据。随后重启 pnpm dev；部署前执行 pnpm build。",
  "icons.privateApiNote":
    "SAX_ICON_API_URL 只供开发与构建配置读取。开发机和 CI 都要设置；线上浏览器不访问这个地址。切换服务后插件会按新地址建立缓存。",
  "icons.svgSource": "4. 完全离线：直接使用自己的 SVG",
  "icons.svgSourceCaption":
    "公司 Logo 或自绘图标可以直接传 SVG 数据，不需要服务、不需要注册按钮。",
  "icons.svgPreview": "这枚图标直接来自下面的 SVG 数据。",
  "icons.svgNote":
    "保留 SVG 的 viewBox，将内部 path、circle 等节点放到 body。需要随主题变色的节点使用 currentColor；只使用可信的 SVG。",
  "icons.localSourceNote":
    "如果连开发和构建都不能访问图标服务，也可以预先安装 {package} 等集合包，将 mode 改为 local；集合别名和动态图标列表保持不变。",
} as const;

export const iconsEn: Record<keyof typeof iconsZh, string> = {
  "nav.icons": "Icon examples",
  "icons.caption":
    "Use icon names, host an intranet API with Docker, or supply SVG data completely offline.",
  "icons.use": "1. Everyday use: provide an icon name",
  "icons.useCaption":
    "Change the selection to see icon morphing. Animations are enabled globally, including button and tab icons; local morph options can customize or disable them.",
  "icons.apiTiming":
    "The development machine or CI contacts the icon service during development and builds. Deployed browsers use bundled SVGs without connecting to a public icon service.",
  "icons.names":
    "demo and nav are project prefixes mapped to Lucide. For example, demo:house uses the Lucide house icon. Set size for dimensions and color for its color.",
  "icons.rocket": "Rocket",
  "icons.verified": "Verified",
  "icons.house": "Home",
  "icons.settings": "Settings",
  "icons.analytics": "Analytics",
  "icons.select": "Switch icon",
  "icons.brand": "Brand icon",
  "icons.config": "2. Project configuration: API and dynamic names",
  "icons.configCaption":
    "Configuration lives in sax-icons.config.ts at the project root. Vite already uses the saxIcons plugin; pages only need SIcon.",
  "icons.dynamicNote":
    "Literal icon names in templates are detected automatically. Names supplied through variables, menu data, or backend responses must be listed in safelist: the list of icons to prepare ahead of time. Only used or listed icons are bundled, rather than the entire collection.",
  "icons.menuNote":
    "Menu management and the build safelist share menuIcons. The picker uses api: false and Admin prebundles its candidates. Add dynamic names and restart development or rebuild; unknown names never trigger browser downloads.",
  "icons.privateApi": "3. Intranet: host your own icon service",
  "icons.privateApiCaption":
    "Use the official iconify/api Docker image, then point development machines and CI at its internal address.",
  "icons.dockerStart":
    "Prepare the image and save icons.json from {package} as /srv/iconify/icon-sets/lucide.json on the server, with prefix lucide. This command reads local JSON without pulling images or remote icon data. Pin a verified image tag or digest for production.",
  "icons.dockerImage": "Docker Hub: iconify/api",
  "icons.deployDocs": "Official deployment guide",
  "icons.dockerOffline":
    "For isolated networks, run the first two lines on a connected machine and transfer both the image tar and prepared lucide.json. Import the image and place the JSON before starting the container. The image alone does not supply offline icons.",
  "icons.setEndpoint":
    "Set the service URL in .env.local at the Admin project root. Replace icons.intranet with a server address reachable from both development machines and CI. Do not use localhost for a remote server.",
  "icons.verifyEndpoint":
    "Check from development or CI that the endpoint returns icons data containing house and settings. Restart pnpm dev afterward, and run pnpm build before deployment.",
  "icons.privateApiNote":
    "SAX_ICON_API_URL is read only by development and build configuration. Set it on development machines and CI; deployed browsers never call it. Changing the endpoint creates a separate plugin cache.",
  "icons.svgSource": "4. Completely offline: use your own SVG",
  "icons.svgSourceCaption":
    "Pass SVG data directly for a company logo or custom artwork. No service or registration button is needed.",
  "icons.svgPreview": "This icon comes directly from the SVG data below.",
  "icons.svgNote":
    "Keep the SVG viewBox and put its inner path, circle, and other nodes in body. Use currentColor for theme-aware coloring, and use only trusted SVG data.",
  "icons.localSourceNote":
    "If development and builds also cannot reach an icon service, install collection packages such as {package} in advance and change mode to local. Keep collection aliases and the dynamic-name list unchanged.",
};
