---
status: implemented
updated_at: 2026-10-21
modules:
  - src/pages/FilesPage.vue
  - src/i18n/expanded.ts
---

# File Center explorer

- File Manager is the first card; Upload queue, Promise picker and Watermark follow it. The standalone three-image gallery is removed.
- Flat file/folder records use stable IDs and local controlled state. Opening a folder uses the component navigation; moves, renames, hidden flags and selection remain component-owned. Reloading restores demo data; no server persistence is implied.
- Double-clicking an image opens SImagePreview with image siblings from the same directory and the matching initial index. The component owns switching, zoom, rotation and closing. Other files show a localized no-viewer message.
- Media paths include import.meta.env.BASE_URL. Chinese/English UI text is typed and localized; language switching retains directory and business data.
- Admin 0.1.5 consumes sax-design-vue 2.8.1 from its versioned GitHub Release archive with a generated integrity-pinned lockfile. No local source links or temporary archive paths are committed.
- Verification: pnpm typecheck, 40 tests and pnpm build pass against the installed release archive. Browser checks cover folder navigation, image opening/switching/zoom/rotation/Escape, gallery removal and language switching with directory retention.
