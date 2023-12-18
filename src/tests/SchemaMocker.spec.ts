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

      const expected = {
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

      expect(schemaMocker.mock(SchemaSampleJson.components.schemas.BlogListComment as never, DEFAULT)).toEqual({
        ...expected,
        replies: [expected]
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
    // test("3", () => {
    //   const schemas = {
    //     "Logo": {
    //       "type": "object",
    //       "properties": {
    //         "url": {
    //           "type": "string"
    //         },
    //         "key": {
    //           "type": "string"
    //         }
    //       },
    //       "required": [
    //         "url",
    //         "key"
    //       ]
    //     },
    //     "Location": {
    //       "type": "object",
    //       "properties": {
    //         "_id": {
    //           "type": "object"
    //         },
    //         "name": {
    //           "type": "string"
    //         }
    //       },
    //       "required": [
    //         "_id",
    //         "name"
    //       ]
    //     },
    //     "Avatar": {
    //       "type": "object",
    //       "properties": {
    //         "url": {
    //           "type": "string"
    //         },
    //         "key": {
    //           "type": "string"
    //         }
    //       },
    //       "required": [
    //         "url",
    //         "key"
    //       ]
    //     },
    //     "User": {
    //       "type": "object",
    //       "properties": {
    //         "_id": {
    //           "type": "object"
    //         },
    //         "username": {
    //           "type": "string"
    //         },
    //         "password": {
    //           "type": "string"
    //         },
    //         "firstName": {
    //           "type": "string"
    //         },
    //         "lastName": {
    //           "type": "string"
    //         },
    //         "role": {
    //           "enum": [
    //             1,
    //             2,
    //             3,
    //             4
    //           ],
    //           "type": "number"
    //         },
    //         "company": {
    //           "$ref": "#/components/schemas/Company"
    //         },
    //         "verified": {
    //           "type": "boolean"
    //         },
    //         "FPToken": {
    //           "type": "string"
    //         },
    //         "NUToken": {
    //           "type": "string"
    //         },
    //         "locations": {
    //           "type": "array",
    //           "items": {
    //             "$ref": "#/components/schemas/Location"
    //           }
    //         },
    //         "changeEmailToken": {
    //           "type": "string"
    //         },
    //         "deleted": {
    //           "type": "boolean"
    //         },
    //         "avatar": {
    //           "$ref": "#/components/schemas/Avatar"
    //         }
    //       },
    //       "required": [
    //         "_id",
    //         "username",
    //         "password",
    //         "firstName",
    //         "lastName",
    //         "role",
    //         "company",
    //         "verified",
    //         "FPToken",
    //         "NUToken",
    //         "locations",
    //         "changeEmailToken",
    //         "deleted",
    //         "avatar"
    //       ]
    //     },
    //     "Company": {
    //       "type": "object",
    //       "properties": {
    //         "logo": {
    //           "$ref": "#/components/schemas/Logo"
    //         },
    //         "name": {
    //           "type": "string"
    //         },
    //         "email": {
    //           "type": "string"
    //         },
    //         "owner": {
    //           "$ref": "#/components/schemas/User"
    //         },
    //         "storage": {
    //           "type": "number"
    //         },
    //         "locations": {
    //           "type": "array",
    //           "items": {
    //             "type": "object"
    //           }
    //         },
    //         "deleted": {
    //           "type": "boolean"
    //         },
    //         "_id": {
    //           "type": "string"
    //         }
    //       },
    //       "required": [
    //         "logo",
    //         "name",
    //         "email",
    //         "owner",
    //         "storage",
    //         "locations",
    //         "deleted",
    //         "_id"
    //       ]
    //     },
    //   }


    //   const schemaMocker = new SchemaMocker(schemas as never)

    //   expect(schemaMocker.mock(schemas.User as never, DEFAULT)).toEqual(null)
    // })
  })
})
