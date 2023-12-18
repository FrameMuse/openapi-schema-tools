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
  const DEFAULT = {
    ...SchemaMocker.DEFAULT_REPLACEMENT,
    boolean: false,
    arraySize: 1
  }

  describe("mock()", () => {
    test("1", () => {
      const schemaMocker = new SchemaMocker(SchemaSampleJson.components.schemas as never)

      expect(schemaMocker.mock(SchemaSampleJson.components.schemas.BlogListComment as never, DEFAULT)).toEqual({
        author: {
          avatar: DEFAULT.string,
          first_name: DEFAULT.string,
          id: DEFAULT.number,
          last_name: DEFAULT.string,
        },
        created_at: DEFAULT.string,
        id: DEFAULT.number,
        is_deleted: DEFAULT.boolean,
        replies: Array(DEFAULT.arraySize),
        text: DEFAULT.string,
      })
    })
    test("2", () => {
      const schemaMocker = new SchemaMocker(SchemaSampleJson.components.schemas as never)

      expect(schemaMocker.mock(SchemaSampleJson.components.schemas.PaginatedBlogListCommentList as never, DEFAULT)).toEqual({
        count: DEFAULT.number,
        results: [
          {
            author: {
              avatar: DEFAULT.string,
              first_name: DEFAULT.string,
              id: DEFAULT.number,
              last_name: DEFAULT.string,
            },
            created_at: DEFAULT.string,
            id: DEFAULT.number,
            is_deleted: DEFAULT.boolean,
            replies: Array(DEFAULT.arraySize),
            text: DEFAULT.string,
          }
        ]
      })
    })
  })
})
