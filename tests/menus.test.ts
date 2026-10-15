import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFetch } from '../src/api/mock';
import type { AdminMenu, MenuInput } from '../src/api/menu-contracts';
import type { Envelope } from '../src/api/contracts';
const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  vi.stubGlobal('window', { location: { origin: 'http://localhost:7869' } });
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
});
async function request<T>(path = '', method = 'GET', body?: unknown, token = 'mock-admin-session') {
  const response = await mockFetch(`/api/menus${path}`, { method, headers: { Authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, body: await response.json() as Envelope<T> };
}
const group = (name: string, parentId = ''): MenuInput => ({ titleZh: name, titleEn: name, parentId, kind: 'group', path: '', icon: 'nav:folder-kanban', order: 100, enabled: true });
describe('mock menu persistence and validation', () => {
  it('persists create and update, returns a fresh list, and supports deletion', async () => {
    const added = await request<AdminMenu>('', 'POST', group('Saved group'));
    expect(added.status).toBe(200);
    const id = added.body.data.id;
    await request(`/${id}`, 'PUT', { ...group('Updated group'), enabled: false });
    const listed = await request<AdminMenu[]>();
    expect(listed.body.data.find((row) => row.id === id)?.titleEn).toBe('Updated group');
    expect(storage.get('sax-mock-menus-v1')).toContain('Updated group');
    await request(`/${id}`, 'DELETE');
    expect((await request<AdminMenu[]>()).body.data.some((row) => row.id === id)).toBe(false);
  });
  it('rejects cycles and prevents deleting groups that have children', async () => {
    const first = (await request<AdminMenu>('', 'POST', group('First'))).body.data;
    const second = (await request<AdminMenu>('', 'POST', group('Second', first.id))).body.data;
    expect((await request(`/${first.id}`, 'PUT', group('First', second.id))).status).toBe(400);
    expect((await request(`/${first.id}`, 'DELETE')).status).toBe(400);
  });
  it('allows viewer reads but rejects writes and invalid page targets', async () => {
    expect((await request('', 'POST', group('Viewer'), 'mock-viewer-session')).status).toBe(403);
    expect((await request('', 'GET', undefined, 'mock-viewer-session')).status).toBe(200);
    expect((await request('', 'POST', { ...group('Invalid'), kind: 'page', path: 'users' })).status).toBe(400);
    expect((await request('', 'POST', { ...group('Invalid'), kind: 'page', path: '//external.example/path' })).status).toBe(400);
  });
  it('stores manually entered paths without requiring a route in this branch', async () => {
    const added = await request<AdminMenu>('', 'POST', { ...group('Future page'), kind: 'page', path: '  /future/report?tab=summary  ' });
    expect(added.status).toBe(200);
    expect(added.body.data.path).toBe('/future/report?tab=summary');
  });
});
