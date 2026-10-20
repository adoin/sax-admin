---
status: implemented
kind: project-specification
updated_at: 2026-10-20
---

# 图标变形组件库更新

- 更新到已验证发布包 sax-design-vue 2.6.1，使用其固定的 svg-morpheus-ts/core 2.0.0。
- 应用安装入口配置 icon.morph，让保留实例的图标变化默认执行 360ms、snappy 动画；图标示例给出局部 morph 用法与中英文说明。
- 保持现有 vue-smart-router alias 和缓存、页面窗口行为。
- 交付前通过 pnpm typecheck、pnpm test、pnpm build 与浏览器图标切换验证。
- 相似区域/跨路径研究只在 SVG-Morpheus-ts 仓库开展，不引入 Admin 或组件库的正式运行路径。

验证：实际使用 2.6.1 归档，通过 typecheck、38 tests 与生产构建；普通 pnpm dev 启动成功。浏览器图标页未传局部 morph 的预览切换时存在 data-morphing 与实际中间帧。项目依赖与锁文件固定正式版本/SRI，无临时路径和 registry 配置。

补充验证：core 2.0.0 的原生描边画出/收回和快照合成已通过组件库回归；Admin 普通 pnpm dev 在归档服务关闭后启动成功，图标页未传局部 morph 的预览触发 data-morphing 与真实中间路径，连续选择首页、设置、分析均正常。依赖、锁文件使用正式版本及发布归档的 SRI。
