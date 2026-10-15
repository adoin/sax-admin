import { writeFile } from 'node:fs/promises';
const base = process.env.SAX_BASE_URL || '/sax-admin/';
if (!base.startsWith('/') || !base.endsWith('/') || base.startsWith('//')) throw new Error('SAX_BASE_URL must be an absolute directory path');
await writeFile('dist/404.html', `<!doctype html><html><head><meta charset="utf-8"><title>Sax Admin</title><script>
const base = ${JSON.stringify(base)};
try { sessionStorage.setItem('sax-pages-route', location.pathname + location.search + location.hash); } catch {}
location.replace(base);
</script></head><body><a href="${base}">Sax Admin</a></body></html>`);
