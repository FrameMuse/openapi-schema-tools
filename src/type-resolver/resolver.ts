import { SetRequired, UnionToIntersection } from "type-fest"
import { SimplifyDeep } from "type-fest/source/merge-deep"

import { ArrayType, DeRefSchema } from "../helpers"
import { Schema, SchemaAny, SchemaRef } from "../types"

// Schema parser

// type dd = ResolveSchema<{ type: "array", items: { type: "string" } }>

// type asd<S> = S extends Schema ? S : never
// type ResolveSchema<S> = ParseSchemaEnhance<S, (
//   S extends SchemaRef ? ResolveSchema<DeRefSchema<S>> :
//   // S extends { allOf: (infer T)[] } ? (ResolveSchema<T>) :
//   // S extends SchemaAnyOf ? ParseSchemaAnyOf<S> :

//   S extends SchemaString ? ParseSchemaString<S> :
//   S extends SchemaNumber ? ParseSchemaNumber<S> :
//   S extends SchemaObject ? ParseSchemaObject<S> :
//   S extends SchemaBoolean ? ParseSchemaBoolean<S> :
//   S extends SchemaArray ? ParseSchemaArray<S> :
//   never
// )>
// type ParseSchemaEnhance<S, O> = O



// Props extends Record<string, Schema> ?
//   (MarkRequired<{ [K in keyof Props]?: ResolveSchema<Props[K]> }, ArrayType<S["required"]>> & S["default"])
//   : never




/**
 * Resolves **OpenAPI JSON Schema**.
 * 
 * To resolve `Schema` you may need a context if there are any `$ref`'s.
 */
type ResolveSchema<S extends SchemaAny, Context extends Record<string, Schema> = {}> =
  S["type"] extends "string" ? string
  : S["type"] extends ("number" | "integer") ? number
  : S["type"] extends "boolean" ? boolean
  : S["type"] extends "array" ? (S["items"] extends {} ? ResolveSchema<S["items"], Context>[] : never[])
  : S["type"] extends "object" ? (
    S["properties"] extends {} ? SimplifyDeep<(
      SetRequired<{ [K in keyof S["properties"]]?: ResolveSchema<S["properties"][K], Context> }, ArrayType<S["required"]>>
    ) & S["default"]>
    : {}
  )

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

const __ResolveSchema_Array__TEST__: ResolveSchema<{ type: "array", items: { type: "object", properties: { foo: { type: "string" } } } }> = [{ foo: "" }]
const __ResolveSchema_Object__TEST__: ResolveSchema<{ type: "object", properties: { foo: { type: "string" } } }> = { foo: "" }
