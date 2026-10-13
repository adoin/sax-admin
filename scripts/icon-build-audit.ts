import { createRequire } from "node:module";
import type { Plugin } from "vite";

export function iconBuildAudit(): Plugin {
  return {
    name: "sax-admin-icon-build-audit",
    apply: "build",
    generateBundle(_options, bundle) {
      const modules = Object.values(bundle).flatMap((chunk) => chunk.type === "chunk" ? Object.entries(chunk.modules) : []);
      const rendered = modules.filter(([, info]) => info.renderedLength > 0).map(([id]) => id);
      const icons = [...new Set(rendered.filter((id) => id.startsWith('\0sax-icon_')).map((id) => decodeURIComponent(id.slice('\0sax-icon_'.length).replace(/_([0-9a-f]{2})/gi, '%$1'))))].sort();
      const collectionShipped = rendered.some((id) => id.includes('@iconify-json/') && id.endsWith('/icons.json'));
      const unusedIconShipped = icons.includes('demo:alarm-clock');
      const unusedImportLoaded = [...this.getModuleIds()].some((id) => id.startsWith('\0sax-icon_') && decodeURIComponent(id.slice('\0sax-icon_'.length).replace(/_([0-9a-f]{2})/gi, '%$1')) === 'demo:alarm-clock');
      const expected = ['demo:rocket', 'demo:badge-check', 'demo:house', 'demo:settings', 'demo:chart-no-axes-combined'];
      if (collectionShipped || unusedIconShipped || !unusedImportLoaded || expected.some((name) => !icons.includes(name))) {
        this.error(`Icon build audit failed: ${JSON.stringify({ icons, collectionShipped, unusedIconShipped })}`);
      }
      const collection = createRequire(import.meta.url)('@iconify-json/lucide/icons.json') as { icons: Record<string, unknown> };
      this.emitFile({ type: 'asset', fileName: 'icon-build-report.json', source: JSON.stringify({
        collection: 'lucide', collectionIconCount: Object.keys(collection.icons).length,
        renderedIcons: icons, renderedIconCount: icons.length,
        fullCollectionShipped: collectionShipped, unusedImportShipped: unusedIconShipped,
        unusedImportLoaded,
        unusedImport: 'demo:alarm-clock', passed: true,
      }, null, 2) });
    },
  };
}
