export const iconsZh = {
  "nav.icons": "图标示例",
  "icons.caption":
    "从按名称使用图标，到内网 Docker 部署与完全离线的 SVG 用法。",
  "icons.use": "1. 日常使用：写图标名称即可",
  "icons.useCaption":
    "本项目使用 API 模式。下面可以切换图标，代码可直接用于页面。",
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
    "例如菜单管理里可选的 nav 图标已经列在项目配置中。增加新的动态图标时，补充名称后重启开发服务或重新构建；未知名称不会让浏览器自动联网找图标。",
  "icons.privateApi": "3. 内网使用：部署自己的图标服务",
  "icons.privateApiCaption":
    "使用 Iconify 官方镜像 iconify/api。先部署服务，再让开发机和 CI 使用内网地址。",
  "icons.dockerStart":
    "在图标服务器上启动容器，将宿主机 3000 端口映射到容器。以下为部署命令。",
  "icons.dockerImage": "Docker Hub：iconify/api",
  "icons.deployDocs": "官方部署说明",
  "icons.dockerOffline":
    "服务器无法联网拉镜像时：先在联网机器执行前两行，将 tar 文件带入内网，在服务器执行最后一行，再运行上面的启动命令。",
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
    "This project uses API mode. Switch the preview below and use the same SIcon syntax in your pages.",
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
    "The nav icons available in menu management are already listed in this project. Add any new dynamic names and restart development or rebuild. Unknown names do not trigger browser downloads.",
  "icons.privateApi": "3. Intranet: host your own icon service",
  "icons.privateApiCaption":
    "Use the official iconify/api Docker image, then point development machines and CI at its internal address.",
  "icons.dockerStart":
    "Start the container on the icon server and map host port 3000 to the container using this command.",
  "icons.dockerImage": "Docker Hub: iconify/api",
  "icons.deployDocs": "Official deployment guide",
  "icons.dockerOffline":
    "If the server cannot pull images: run the first two lines on a connected machine, transfer the tar file to the intranet, and run the last line on the server. Then use the start command above.",
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
