import SchemaMocker from "../SchemaMocker"
import { SchemaSampleJson } from "./schema.json"

/**
 * Helps prevent error logs blowing up as a result of expecting an error to be thrown,
 * when using a library (such as enzyme)
 *
 * @param fn Function that you would normally pass to `expect(func).toThrow()`
 */
export function expectToThrow(fn: () => unknown, error?: Parameters<jest.Matchers<void>["toThrow"]>[0]): void {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  const spy = jest.spyOn(console, "error")
  spy.mockImplementation(() => void 0)

  expect(fn).toThrow(error)

  spy.mockRestore()
}

describe("SchemaMocker", () => {
  describe("mock()", () => {
    test("1", () => {
      const schemaMocker = new SchemaMocker(SchemaSampleJson.components.schemas as never)

      expect(schemaMocker.mock(SchemaSampleJson.components.schemas.BlogListComment as never)).toEqual({
        author: {
          avatar: "[missing value]",
          first_name: "[missing value]",
          id: -1,
          last_name: "[missing value]",
        },
        created_at: "[missing value]",
        id: -1,
        is_deleted: false,
        replies: [],
        text: "[missing value]",
      })
    })
  })
})
