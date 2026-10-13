import { http } from './client';
import type { PageResult } from './contracts';
import type { AdminInput, AdminQuery, AuditEntry, AuditQuery, ResourceKind, ResourceMap } from './admin-contracts';
export const resourcesApi = {
  list: <K extends ResourceKind>(kind: K, query: AdminQuery) => http.Get<PageResult<ResourceMap[K]>>(`/${kind}`, { params: query }),
  save(input: AdminInput, id?: string) {
    if (input.kind === 'roles') return id ? http.Put<ResourceMap['roles']>(`/roles/${id}`, input) : http.Post<ResourceMap['roles']>('/roles', input);
    if (input.kind === 'departments') return id ? http.Put<ResourceMap['departments']>(`/departments/${id}`, input) : http.Post<ResourceMap['departments']>('/departments', input);
    return id ? http.Put<ResourceMap['dictionaries']>(`/dictionaries/${id}`, input) : http.Post<ResourceMap['dictionaries']>('/dictionaries', input);
  },
  remove: (kind: ResourceKind, id: string) => http.Delete<null>(`/${kind}/${id}`),
};
export const auditApi = { list: (query: AuditQuery) => http.Get<PageResult<AuditEntry>>('/audit-logs', { params: query }) };
export const assistantApi = { reply: (prompt: string) => http.Post<{ content: string }>('/assistant/reply', { prompt }) };
