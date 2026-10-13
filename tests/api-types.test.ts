import { expectTypeOf, it } from "vitest";
import type { usersApi, authApi } from "../src/api";
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
});
