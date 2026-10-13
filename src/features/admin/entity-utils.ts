import { locale } from '@/i18n';
import type { AdminEntry, DepartmentEntry } from '@/api/admin-contracts';
export const entryName = (row: AdminEntry) => locale.value === 'zh-CN' ? row.nameZh : row.nameEn;
export function departmentTree(rows: DepartmentEntry[]): DepartmentEntry[] {
  const ids = new Set(rows.map((row) => row.id));
  const build = (parentId: string, ancestors = new Set<string>()): DepartmentEntry[] => rows.filter((row) => !ancestors.has(row.id) && (row.parentId === parentId || (!parentId && !ids.has(row.parentId)))).map((row) => ({ ...row, children: build(row.id, new Set([...ancestors, row.id])) }));
  return build('');
}
