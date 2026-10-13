import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFetch } from '../src/api/mock';
import type { AuditEntry, DepartmentEntry, DictionaryEntry, RoleEntry, RoleInput } from '../src/api/admin-contracts';
import type { Envelope, PageResult } from '../src/api/contracts';
const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  vi.stubGlobal('window', { location: { origin: 'http://localhost:7869' } });
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
});
async function request<T>(path: string, method = 'GET', body?: unknown, token = 'mock-admin-session') {
  const response = await mockFetch(`/api${path}`, { method, headers: { Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, data: (await response.json() as Envelope<T>).data };
}
const role: RoleInput = { kind: 'roles', nameZh: '验证角色', nameEn: 'Test role', code: 'test-role', enabled: true, description: '', permissions: ['users.read'] };
describe('expanded admin page contracts', () => {
  it('persists role mutations and records audit events', async () => {
    const added = await request<RoleEntry>('/roles', 'POST', role);
    expect(added.status).toBe(200);
    expect(storage.get('sax-mock-admin-roles-v1')).toContain('test-role');
    const listed = await request<PageResult<RoleEntry>>('/roles?keyword=test-role');
    expect(listed.data.items).toHaveLength(1);
    const logs = await request<PageResult<AuditEntry>>('/audit-logs?module=roles&keyword=Test');
    expect(logs.data.items.some((row) => row.action === 'create' && row.detailEn === 'Test role')).toBe(true);
    expect((await request('/roles', 'POST', role)).status).toBe(400);
    expect((await request('/roles', 'POST', { ...role, code: 'other', permissions: ['unknown'] })).status).toBe(400);
    await request(`/roles/${added.data.id}`, 'DELETE');
    expect((await request<PageResult<RoleEntry>>('/roles?keyword=test-role')).data.total).toBe(0);
  });
  it('preserves department hierarchy and rejects cyclic parents', async () => {
    const listed = await request<PageResult<DepartmentEntry>>('/departments?pageSize=2000');
    const root = listed.data.items.find((row) => !row.parentId)!;
    const child = listed.data.items.find((row) => row.parentId === root.id)!;
    expect((await request(`/departments/${root.id}`, 'PUT', { ...root, parentId: child.id })).status).toBe(400);
    expect((await request(`/departments/${root.id}`, 'DELETE')).status).toBe(400);
    const filtered = await request<PageResult<DepartmentEntry>>('/departments?keyword=Engineering&pageSize=2000');
    expect(filtered.data.items.some((row) => row.id === root.id)).toBe(true);
    expect(filtered.data.items.some((row) => row.id === child.id)).toBe(true);
  });
  it('supports dictionary filtering and enforces viewer write restrictions', async () => {
    const result = await request<PageResult<DictionaryEntry>>('/dictionaries?enabled=disabled', 'GET', undefined, 'mock-viewer-session');
    expect(result.data.items.every((row) => !row.enabled)).toBe(true);
    expect((await request('/roles', 'POST', role, 'mock-viewer-session')).status).toBe(403);
  });
  it('returns a simulated assistant response and rejects an empty prompt', async () => {
    expect((await request<{ content: string }>('/assistant/reply', 'POST', { prompt: 'Planning test' })).data.content).toContain('Planning test');
    expect((await request('/assistant/reply', 'POST', { prompt: '' })).status).toBe(400);
  });
  it('adds new navigation entries without restoring intentionally deleted old ones', async () => {
    storage.set('sax-mock-menus-v1', JSON.stringify([]));
    const menus = await request<Array<{ id: string; path: string }>>('/menus');
    expect(menus.data.some((row) => row.path === '/roles')).toBe(true);
    expect(menus.data.some((row) => row.path === '/users')).toBe(false);
    const second = await request<Array<{ id: string; path: string }>>('/menus');
    expect(second.data).toEqual(menus.data);
  });
});
