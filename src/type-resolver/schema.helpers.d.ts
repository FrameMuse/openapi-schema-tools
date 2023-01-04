import { SimplifyDeep } from "type-fest/source/merge-deep"

import { SchemaContent, SchemaParameter, SchemaResponses, Schemas } from "../types"
import ResolveSchema from "./resolver"

export module SchemaInfer {
  export type Response<T, K extends string | number = string | number> = T extends SchemaResponses<K> ? T["responses"][K] : never
  export type Content<T> = T extends SchemaContent ? T["content"][string]["schema"] : never


  // export type Path<T, K extends string | number = string | number> = T extends SchemaResponses<K> ? T["responses"][K] : never
}

/**
 * To resolve `Schema` you may need a context if there are any `$ref`'s.
 */
export module SchemaResolve {
  export type Parameter<T extends SchemaParameter, Context extends Schemas> = (
    T["required"] extends true
    ? { [K in T["name"]]: ResolveSchema<T["schema"], Context> }
    : { [K in T["name"]]?: ResolveSchema<T["schema"], Context> }
  )
  export type Parameters<T extends SchemaParameter[], Context extends Schemas> = SimplifyDeep<
    & { [P in (T[number]) as (P["required"] extends true ? P["name"] : never)]: ResolveSchema<P["schema"], Context> }
    & { [P in (T[number]) as (P["required"] extends true ? never : P["name"])]?: ResolveSchema<P["schema"], Context> }
  >
}
