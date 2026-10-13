export const permissionKeys = ['users.read', 'users.write', 'menus.write', 'roles.write', 'departments.write', 'dictionaries.write', 'logs.read'] as const;
export type Permission = (typeof permissionKeys)[number];
export type ResourceKind = 'roles' | 'departments' | 'dictionaries';
export interface EntryBase { id: string; nameZh: string; nameEn: string; code: string; enabled: boolean; description: string }
export interface RoleEntry extends EntryBase { kind: 'roles'; permissions: Permission[] }
export interface DepartmentEntry extends EntryBase { kind: 'departments'; parentId: string; manager: string; email: string; children?: DepartmentEntry[] }
export interface DictionaryEntry extends EntryBase { kind: 'dictionaries'; category: string; value: string }
export type AdminEntry = RoleEntry | DepartmentEntry | DictionaryEntry;
export type RoleInput = Omit<RoleEntry, 'id'>;
export type DepartmentInput = Omit<DepartmentEntry, 'id' | 'children'>;
export type DictionaryInput = Omit<DictionaryEntry, 'id'>;
export type AdminInput = RoleInput | DepartmentInput | DictionaryInput;
export interface ResourceMap { roles: RoleEntry; departments: DepartmentEntry; dictionaries: DictionaryEntry }
export interface AdminQuery { keyword: string; enabled: string; page: number; pageSize: number }
export interface AuditEntry { id: string; actor: string; action: 'create' | 'update' | 'delete' | 'login'; module: ResourceKind | 'menus' | 'session'; status: 'success' | 'failed'; time: string; address: string; detailZh: string; detailEn: string }
export interface AuditQuery { keyword: string; module: string; status: string; page: number; pageSize: number }
