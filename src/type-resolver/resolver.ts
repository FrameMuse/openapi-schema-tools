
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
  : S["type"] extends "object" ? SimplifyDeep<(
    SetRequired<{ [K in keyof NonNullable<S["properties"]>]?: ResolveSchema<NonNullable<S["properties"]>[K], Context> }, ArrayType<S["required"]>>
  ) & S["default"]>

  : S extends ({ $ref: string }) ? ResolveSchema<DeRefSchema<S, Context>, Context>
  : S extends ({ anyOf: SchemaRef[] }) ? ResolveSchema<ArrayType<S["anyOf"]>, Context>
  : S extends ({ oneOf: SchemaRef[] }) ? ResolveSchema<ArrayType<S["oneOf"]>, Context>
  : S extends ({ allOf: SchemaRef[] }) ? UnionToIntersection<ResolveSchema<ArrayType<S["allOf"]>, Context>>
  : never
// type ParseSchemaEnhance<S, O> = S extends Schema ? (O | IfNullable<S>) : never
// type ParseSchema__TEST__ = ResolveSchema<SwaggerSchema["components"]["schemas"]["AccountsMe"]>
// type ParseSchema__TEST__ = ResolveSchema<{ type: "string" }>
// type ParseSchema__TEST__ = ResolveSchema<{ type: "object", properties: { foo: { type: "string" } } }>

// Schema parser helpers

// type ParseSchemaArray<S extends SchemaArray> = ResolveSchema<S["items"]>[]
// type ParseSchemaNumber<S extends SchemaNumber> = number
// type ParseSchemaString<S extends SchemaString> = string
// type ParseSchemaBoolean<S extends SchemaBoolean> = boolean

// type ParseSchemaAllOf<S> = UnionToIntersection<S extends ({ allOf: (infer T)[] }) ? ResolveSchema<T> : never>
// // type ParseSchemaAllOf<S extends SchemaAllOf> = ResolveSchema<DeRefSchema<ArrayType<S["allOf"]> extends SchemaRef ? ArrayType<S["allOf"]> : never>>
// type ParseSchemaAnyOf<S> = S extends ({ anyOf: (infer T)[] }) ? "anyOf" : never

export default ResolveSchema
