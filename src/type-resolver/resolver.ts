import { EmptyObject, SetRequired, UnionToIntersection } from "type-fest"
import { BuiltIns } from "type-fest/source/internal"
import { SimplifyDeep } from "type-fest/source/merge-deep"

import { ArrayType, DeRefSchema } from "../helpers"
import { SchemaAny, SchemaRef, Schemas } from "../types"

/**
 * Resolves **OpenAPI JSON Schema**.
 * 
 * To resolve `Schema` you may need a context if there are any `$ref`'s.
 */
type ResolveSchema<S extends SchemaAny, Context extends Schemas = {}> =
  S extends (EmptyObject | unknown[] | never | BuiltIns) ? never
  : S["type"] extends "string" ? string
  : S["type"] extends ("number" | "integer") ? number
  : S["type"] extends "boolean" ? boolean

  : S["type"] extends "array" ? (S["items"] extends object ? ResolveSchema<S["items"], Context>[] : never[])
  : S["type"] extends "object" ? (
    S["properties"] extends object ? SimplifyDeep<(
      SetRequired<{ [K in keyof S["properties"]]?: ResolveSchema<S["properties"][K], Context> }, ArrayType<S["required"]>>
    )>
    : Record<keyof never, unknown>
  ) & S["default"]

  : S extends ({ $ref: string }) ? ResolveSchema<DeRefSchema<S, Context>, Context>
  : S extends ({ anyOf: SchemaRef[] }) ? ResolveSchema<ArrayType<S["anyOf"]>, Context>
  : S extends ({ oneOf: SchemaRef[] }) ? ResolveSchema<ArrayType<S["oneOf"]>, Context>
  : S extends ({ allOf: SchemaRef[] }) ? UnionToIntersection<ResolveSchema<ArrayType<S["allOf"]>, Context>>
  : never

export default ResolveSchema

/* eslint-disable @typescript-eslint/no-unused-vars */

const __ResolveSchema_String__TEST__: ResolveSchema<{ type: "string" }> = ""
const __ResolveSchema_Number__TEST__: ResolveSchema<{ type: "number" }> = 0
const __ResolveSchema_Integer__TEST__: ResolveSchema<{ type: "integer" }> = 0
const __ResolveSchema_Boolean__TEST__: ResolveSchema<{ type: "boolean" }> = true

const __ResolveSchema_Never__TEST__: never = {} as ResolveSchema<never>

const __ResolveSchema_Array__TEST__: ResolveSchema<{ type: "array", items: { type: "object", properties: { foo: { type: "string" } } } }> = [{ foo: "" }]
const __ResolveSchema_Object__TEST__: ResolveSchema<{ type: "object", properties: { foo: { type: "string" } } }> = { foo: "" }
const __ResolveSchema_Object_Default__TEST__: ResolveSchema<{ type: "object", default: { foo: { bar: "something" } } }> = { foo: { bar: "something" } }

const __ResolveSchema_Object_EMPTY__TEST__: ResolveSchema<{}> = 1 as never
