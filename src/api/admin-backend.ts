import Mock from 'mockjs';
import { permissionKeys } from './admin-contracts';
import type { AdminEntry, AdminInput, AuditEntry, ResourceKind } from './admin-contracts';
const memory = new Map<string, unknown>();
const storageKey = (key: string) => `sax-mock-admin-${key}-v1`;
function persist(key: string, value: unknown) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey(key), JSON.stringify(value));
  memory.set(key, value);
}
function load(key: string): unknown {
  if (typeof localStorage !== 'undefined') { try { return JSON.parse(localStorage.getItem(storageKey(key)) || 'null'); } catch { return null; } }
  return memory.get(key);
}
function seed(kind: ResourceKind): AdminEntry[] {
  const base = (id: string, nameZh: string, nameEn: string, code: string) => ({ id, nameZh, nameEn, code, enabled: true, description: '' });
  if (kind === 'roles') return [
    { ...base('role-admin', '管理员', 'Administrator', 'admin'), kind, permissions: [...permissionKeys] },
    { ...base('role-editor', '业务编辑', 'Business editor', 'editor'), kind, permissions: ['users.read', 'users.write', 'logs.read'] },
    { ...base('role-viewer', '只读访客', 'Read-only viewer', 'viewer'), kind, permissions: ['users.read', 'logs.read'] },
  ];
  if (kind === 'departments') return [
    { ...base('dept-root', '总部', 'Headquarters', 'hq'), kind, parentId: '', manager: 'Adoin Wang', email: 'adoin@example.com' },
    ...['研发', '设计', '运营', '客户成功'].map((name, i) => ({ ...base(`dept-${i}`, `${name}中心`, ['Engineering', 'Design', 'Operations', 'Customer success'][i]!, `unit-${i}`), kind: 'departments' as const, parentId: 'dept-root', manager: Mock.Random.cname(), email: Mock.Random.email('example.com') })),
  ];
  return Array.from({ length: 12 }, (_, i) => ({ ...base(`dict-${i}`, `配置项 ${i + 1}`, `Option ${i + 1}`, `option-${i + 1}`), kind, category: ['status', 'priority', 'channel'][i % 3]!, value: String(i + 1), enabled: i % 5 !== 0 }));
}
function validBase(value: unknown): value is AdminEntry {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== 'string' || !['roles', 'departments', 'dictionaries'].includes(String(row.kind)) || !['nameZh', 'nameEn', 'code', 'description'].every((key) => typeof row[key] === 'string') || typeof row.enabled !== 'boolean') return false;
  if (row.kind === 'roles') return Array.isArray(row.permissions) && row.permissions.every((item: unknown) => permissionKeys.some((key) => key === item));
  if (row.kind === 'departments') return ['parentId', 'manager', 'email'].every((key) => typeof row[key] === 'string');
  return typeof row.category === 'string' && typeof row.value === 'string';
}
export function readEntries(kind: ResourceKind): AdminEntry[] {
  const saved = load(kind);
  if (Array.isArray(saved) && saved.every((row: unknown) => validBase(row) && row.kind === kind)) return structuredClone(saved as AdminEntry[]);
  const rows = seed(kind); persist(kind, rows); return structuredClone(rows);
}
function validate(kind: ResourceKind, value: unknown, rows: AdminEntry[], id?: string): AdminInput {
  if (!value || typeof value !== 'object') throw new Error('business.invalid');
  const source = value as Record<string, unknown>;
  if (source.kind !== kind || !['nameZh', 'nameEn', 'code', 'description'].every((key) => typeof source[key] === 'string') || typeof source.enabled !== 'boolean') throw new Error('business.invalid');
  const nameZh = String(source.nameZh).trim(), nameEn = String(source.nameEn).trim(), code = String(source.code).trim();
  if (!nameZh || !nameEn || !/^[a-z0-9][a-z0-9_.-]{1,47}$/i.test(code)) throw new Error('business.invalid');
  if (rows.some((row) => row.id !== id && row.code.toLowerCase() === code.toLowerCase())) throw new Error('business.duplicate');
  const base = { nameZh, nameEn, code, enabled: source.enabled, description: String(source.description) };
  if (kind === 'roles') {
    if (!Array.isArray(source.permissions) || !source.permissions.every((item: unknown) => permissionKeys.some((key) => key === item))) throw new Error('business.invalid');
    return { ...base, kind, permissions: [...new Set(source.permissions)] as typeof permissionKeys[number][] };
  }
  if (kind === 'departments') {
    if (!['parentId', 'manager', 'email'].every((key) => typeof source[key] === 'string')) throw new Error('business.invalid');
    let parent = String(source.parentId); const seen = new Set(id ? [id] : []);
    while (parent) { if (seen.has(parent)) throw new Error('menus.cycle'); seen.add(parent); const row = rows.find((row) => row.id === parent); if (!row || row.kind !== 'departments') throw new Error('menus.invalidParent'); parent = row.parentId; }
    return { ...base, kind, parentId: String(source.parentId), manager: String(source.manager), email: String(source.email) };
  }
  if (typeof source.category !== 'string' || !source.category.trim() || typeof source.value !== 'string' || !source.value.trim()) throw new Error('business.invalid');
  return { ...base, kind, category: source.category.trim(), value: source.value.trim() };
}
export function readAudit(): AuditEntry[] {
  const saved = load('audit');
  if (Array.isArray(saved)) return saved as AuditEntry[];
  const rows: AuditEntry[] = Array.from({ length: 80 }, (_, i) => ({ id: `audit-${i}`, actor: i % 3 ? Mock.Random.cname() : 'Adoin Wang', action: ['login', 'create', 'update', 'delete'][i % 4] as AuditEntry['action'], module: ['session', 'roles', 'departments', 'dictionaries'][i % 4] as AuditEntry['module'], status: i % 11 ? 'success' : 'failed', time: new Date(Date.now() - i * 1800000).toISOString(), address: Mock.Random.ip(), detailZh: `演示操作记录 ${i + 1}`, detailEn: `Demo operation ${i + 1}` }));
  persist('audit', rows); return rows;
}
export function recordAudit(module: AuditEntry['module'], action: AuditEntry['action'], detailZh: string, detailEn: string) {
  const rows = readAudit();
  persist('audit', [{ id: Mock.Random.guid(), actor: 'Adoin Wang', action, module, status: 'success', time: new Date().toISOString(), address: '127.0.0.1', detailZh, detailEn }, ...rows].slice(0, 500));
}
export const adminBackend = {
  list(kind: ResourceKind, params: URLSearchParams) {
    const keyword = (params.get('keyword') || '').toLowerCase(), enabled = params.get('enabled') || '';
    const all = readEntries(kind);
    let rows = all.filter((row) => (!keyword || `${row.nameZh} ${row.nameEn} ${row.code}`.toLowerCase().includes(keyword)) && (!enabled || row.enabled === (enabled === 'active')));
    if (kind === 'departments') {
      const ids = new Set(rows.map((row) => row.id));
      rows.forEach((row) => { let current = row; const seen = new Set<string>(); while (current.kind === 'departments' && current.parentId && !seen.has(current.parentId)) { const parentId = current.parentId; seen.add(parentId); const parent = all.find((item) => item.id === parentId); if (!parent) break; ids.add(parent.id); current = parent; } });
      rows = all.filter((row) => ids.has(row.id));
    }
    const page = Math.max(1, Number(params.get('page')) || 1), pageSize = Math.min(2000, Math.max(1, Number(params.get('pageSize')) || 10));
    return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length };
  },
  save(kind: ResourceKind, input: unknown, id?: string) {
    const rows = readEntries(kind);
    if (id && !rows.some((row) => row.id === id)) throw new Error('menus.missing');
    const entry = { ...validate(kind, input, rows, id), id: id || Mock.Random.guid() } as AdminEntry;
    persist(kind, id ? rows.map((row) => row.id === id ? entry : row) : [...rows, entry]);
    recordAudit(kind, id ? 'update' : 'create', entry.nameZh, entry.nameEn); return entry;
  },
  remove(kind: ResourceKind, id: string) {
    const rows = readEntries(kind), entry = rows.find((row) => row.id === id);
    if (!entry) throw new Error('menus.missing');
    if (kind === 'departments' && rows.some((row) => row.kind === 'departments' && row.parentId === id)) throw new Error('menus.hasChildren');
    persist(kind, rows.filter((row) => row.id !== id)); recordAudit(kind, 'delete', entry.nameZh, entry.nameEn);
  },
  audit(params: URLSearchParams) {
    const keyword = (params.get('keyword') || '').toLowerCase();
    const rows = readAudit().filter((row) => (!keyword || `${row.actor} ${row.detailZh} ${row.detailEn} ${row.address}`.toLowerCase().includes(keyword)) && (!params.get('module') || row.module === params.get('module')) && (!params.get('status') || row.status === params.get('status')));
    const page = Math.max(1, Number(params.get('page')) || 1), size = Math.min(2000, Math.max(1, Number(params.get('pageSize')) || 10));
    return { items: rows.slice((page - 1) * size, page * size), total: rows.length };
  },
};
