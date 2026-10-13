import { expectTypeOf, it } from "vitest";
import type { usersApi, authApi } from "../src/api";
import type { resourcesApi, auditApi } from '../src/api/admin';
import type { RoleEntry, DepartmentEntry, DictionaryEntry, AuditEntry, AdminInput } from '../src/api/admin-contracts';
import type {
  User,
  UserInput,
  UserQuery,
  PageResult,
  Session,
  LoginInput,
} from "../src/api/contracts";
it("preserves request and awaited response types through Alova", () => {
  expectTypeOf<
    Parameters<typeof usersApi.list>[0]
  >().toEqualTypeOf<UserQuery>();
  expectTypeOf<
    Parameters<typeof usersApi.create>[0]
  >().toEqualTypeOf<UserInput>();
  expectTypeOf<Awaited<ReturnType<typeof usersApi.list>>>().toEqualTypeOf<
    PageResult<User>
  >();
  expectTypeOf<
    Awaited<ReturnType<typeof usersApi.create>>
  >().toEqualTypeOf<User>();
  expectTypeOf<
    Parameters<typeof authApi.login>[0]
  >().toEqualTypeOf<LoginInput>();
  expectTypeOf<
    Awaited<ReturnType<typeof authApi.login>>
  >().toEqualTypeOf<Session>();
  expectTypeOf<Awaited<ReturnType<typeof resourcesApi.list<'roles'>>>>().toEqualTypeOf<PageResult<RoleEntry>>();
  expectTypeOf<Awaited<ReturnType<typeof resourcesApi.list<'departments'>>>>().toEqualTypeOf<PageResult<DepartmentEntry>>();
  expectTypeOf<Awaited<ReturnType<typeof resourcesApi.list<'dictionaries'>>>>().toEqualTypeOf<PageResult<DictionaryEntry>>();
  expectTypeOf<Parameters<typeof resourcesApi.save>[0]>().toEqualTypeOf<AdminInput>();
  expectTypeOf<Awaited<ReturnType<typeof auditApi.list>>>().toEqualTypeOf<PageResult<AuditEntry>>();
});
