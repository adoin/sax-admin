import { defaultMenus } from "./menu-defaults";
import { menuIcons } from "./menu-contracts";
import type { AdminMenu, MenuInput } from "./menu-contracts";
import { navigation } from "@/router/navigation";
const storageKey = "sax-mock-menus-v1";
const catalogKey = 'sax-mock-menu-catalog-v1';
const legacyIds = ['section.workspace', 'section.insights', 'section.examples', 'section.system', ...['/menus', '/icons', '/workspace', '/dashboard', '/users', '/charts', '/orders', '/projects', '/forms', '/components', '/maps', '/settings'].map((path) => `page:${path}`)];
let memory: AdminMenu[] | undefined;
function isInput(value: unknown): value is MenuInput {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.titleZh === "string" && Boolean(row.titleZh.trim()) && typeof row.titleEn === "string" && Boolean(row.titleEn.trim()) && ["page", "group"].includes(String(row.kind)) && typeof row.parentId === "string" && typeof row.path === "string" && typeof row.icon === "string" && (row.icon === "" || menuIcons.some((icon) => icon === row.icon)) && typeof row.order === "number" && Number.isFinite(row.order) && row.order >= 0 && typeof row.enabled === "boolean";
}
function read(): AdminMenu[] {
  if (typeof localStorage !== "undefined") {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (Array.isArray(saved) && saved.every((row) => isInput(row) && "id" in row && typeof row.id === "string")) {
        const storedCatalog: unknown = JSON.parse(localStorage.getItem(catalogKey) || 'null');
        const known = new Set(Array.isArray(storedCatalog) ? storedCatalog.filter((id): id is string => typeof id === 'string') : legacyIds);
        const existing = new Set(saved.map((row: AdminMenu) => row.id));
        const defaults = defaultMenus();
        const additions = defaults.filter((row) => !known.has(row.id) && !existing.has(row.id));
        const allIds = new Set([...existing, ...additions.map((row) => row.id)]);
        const rows: AdminMenu[] = [...saved, ...additions.map((row) => ({ ...row, parentId: row.parentId && !allIds.has(row.parentId) ? '' : row.parentId }))];
        if (additions.length || defaults.some((row) => !known.has(row.id))) write(rows);
        return rows;
      }
    } catch { /* Fall back to the demo defaults for invalid stored data. */ }
    return defaultMenus();
  }
  return memory || defaultMenus();
}
function write(rows: AdminMenu[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(rows));
    localStorage.setItem(catalogKey, JSON.stringify(defaultMenus().map((row) => row.id)));
  }
  memory = rows;
}
function validate(input: unknown, rows: AdminMenu[], id?: string): MenuInput {
  if (!isInput(input)) throw new Error("menus.invalid");
  if (input.kind === "page" && !navigation.some((item) => item.path === input.path)) throw new Error("menus.invalidPath");
  const seen = new Set<string>(id ? [id] : []);
  let parentId = input.parentId;
  while (parentId) {
    if (seen.has(parentId)) throw new Error("menus.cycle");
    seen.add(parentId);
    const parent = rows.find((row) => row.id === parentId);
    if (!parent || parent.kind !== "group") throw new Error("menus.invalidParent");
    parentId = parent.parentId;
  }
  if (id && input.kind === "page" && rows.some((row) => row.parentId === id)) throw new Error("menus.hasChildren");
  return { ...input, titleZh: input.titleZh.trim(), titleEn: input.titleEn.trim(), path: input.kind === "group" ? "" : input.path };
}
export const menuBackend = {
  list: () => structuredClone(read()),
  create(input: unknown, id: string) {
    const rows = read(), row = { ...validate(input, rows), id };
    write([...rows, row]); return structuredClone(row);
  },
  update(id: string, input: unknown) {
    const rows = read();
    if (!rows.some((row) => row.id === id)) throw new Error("menus.missing");
    const row = { ...validate(input, rows, id), id };
    write(rows.map((item) => item.id === id ? row : item)); return structuredClone(row);
  },
  remove(id: string) {
    const rows = read();
    if (!rows.some((row) => row.id === id)) throw new Error("menus.missing");
    if (rows.some((row) => row.parentId === id)) throw new Error("menus.hasChildren");
    write(rows.filter((row) => row.id !== id));
  },
};
