# Changelog

## 0.1.4 — 2026-10-21

- Upgrade `sax-design-vue` to 2.7.0 and `sax-design-vue-iconify` to 1.1.0, retaining the shared morph core and globally enabled icon morphing.
- Prebundle the menu picker candidates in the admin application through the shared menu icon list; disable runtime picker API requests for intranet/offline use.
- Register `src/assets/svgs/**/*.svg` through `signSvgs` with the `lo-` namespace, emitting only referenced/safelisted SVGs and sharing identical data.
- Update both icon-guide locales to stage local Lucide JSON for intranet Docker deployment and disable remote icon sources.
- Consume library bundles containing only internal control SVG fallbacks, and retain application-side Iconify extraction without shipping full collections.

## 0.1.3 — 2026-10-20

- Upgrade `sax-design-vue` to 2.6.1, using the shared `svg-morpheus-ts/core` 2.0.0 geometry and paint pipeline.
- Keep icon morphing enabled globally by default; native stroke contours draw/retract along their paths, and rapid target changes continue from current geometry and paint.
- Include disappearing-stroke endpoint cleanup and interruption snapshots that avoid multiplying geometry paths.
- Preserve application routing, cached/pinned pages, local morph overrides and reduced-motion preferences.

## 0.1.2 — 2026-10-19

- Upgrade `sax-design-vue` to the 2.3.1 emergency patch, fixing unresolved on-demand CSS imports in the published package.

- Upgrade `sax-design-vue-iconify` to 1.0.2 so ESM and CommonJS consumers share registered icon data.

## 0.1.1 — 2026-10-16

- Upgrade `sax-design-vue` to 2.3.0.
- Adopt the blue-violet dark palette and improved contrast for controls, tags, lists, tables, and disabled actions.
- Include isolated overlay layers to avoid unnecessary popup updates and preserve smooth Select placeholder dissolve animations.
- Include improved image loading surfaces and table selection, fixed-column shadows, and editing layouts.
