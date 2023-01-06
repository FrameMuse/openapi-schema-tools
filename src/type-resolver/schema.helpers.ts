/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
import { SimplifyDeep } from "type-fest/source/merge-deep"

import { SchemaContent, SchemaParameter, SchemaRequest, SchemaResponses, Schemas } from "../types"
import ResolveSchema from "./resolver"

export module SchemaInfer {
  export type Content<T> = T extends SchemaContent ? T["content"][keyof T["content"]]["schema"] : never

  export type Request<T> = T extends SchemaRequest ? Content<T["requestBody"]> : never
  export type Response<T, K extends string | number = string | number> = T extends SchemaResponses<K> ? Content<T["responses"][keyof T["responses"]]> : never

  // export type MethodPaths<M extends RequestMethod> = 1
  // export type Path<T, K extends string | number = string | number> = T extends SchemaResponses<K> ? T["responses"][K] : never

  /* TESTS */
  type __CONTENT_SAMPLE__ = { content: { "asd": { schema: { type: "string" } } } }
  const __CONTENT_EXPECTED__ = { type: "string" } as const

  const __Content__TEST__: Content<__CONTENT_SAMPLE__> = __CONTENT_EXPECTED__
  const __Request__TEST__: Request<{ requestBody: __CONTENT_SAMPLE__ }> = __CONTENT_EXPECTED__
  const __Response__TEST__: Response<{ responses: { "asd": __CONTENT_SAMPLE__ } }> = __CONTENT_EXPECTED__
}

/**
 * Utils for solving other types of Schema.
 * 
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
