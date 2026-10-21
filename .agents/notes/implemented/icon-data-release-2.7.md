---
status: implemented
kind: project-specification
completed_at: 2026-10-21
---

# Icon library 2.7 integration

- Pin sax-design-vue 2.7.0 and sax-design-vue-iconify 1.1.0. Keep svg-morpheus-ts 2.0.0 and global icon morphing enabled.
- Share the pure `menuIcons` name list between the application build safelist and MenuEditor. The menu picker uses `api: false`; its 12 candidates are prebundled in Admin instead of fetched by the browser.
- Register `src/assets/svgs/**/*.svg` as `lo-` through signSvgs. Only literal references or safelists emit SVG data; identical content shares a module. The directory may remain absent until the application adds assets.
- Retain build-time `SAX_ICON_API_URL` support for public/private API sources. Component library code contains only its required control fallbacks; application SVG data belongs to Admin.
- Canonical dependencies and lockfile SRI match the actual successful npm publish archives. A temporary archive registry was used only while npm metadata was processing; no temporary URLs, file dependencies or registry configuration remain, and the ordinary official-registry frozen install passes.

Validation: typecheck, all 38 tests and the production build pass. The production audit contains 17 referenced/safelisted business icon names, no full Lucide collection and no unused alarm-clock payload. Browser verification shows all 12 menu picker candidates with actual SVG geometry; the test form and picker were cancelled without saving data, then the original Icons page was restored.
