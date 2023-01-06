// Helpers


import { SchemaRef, Schemas } from "./types"

/**
 * https://stackoverflow.com/questions/56687668/a-way-to-disable-type-argument-inference-in-generics
 */
export type NoInfer<T> = [T][T extends unknown ? 0 : never]
export type ArrayType<T> = T extends (infer I)[] ? I : never

// /**
//  * https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
//  */
// export type Intersect<U> = (U extends {} ? (o: U) => void : never) extends ((o: infer I) => void) ? I : never
// type Intersect__TEST__ = Intersect<{ b: 2 } | { a: 1 }> // Expected: { b: 2 } & { a: 1 }

// export type PartialIntersect<U> = (U extends {} ? (o: Partial<U>) => void : never) extends ((o: infer I) => void) ? I : never
// type PartialIntersect__TEST__ = PartialIntersect<{ b: 2 } | { a: 1 }> // Expected: Partial<{ b: 2 }> & Partial<{ a?: 1 }>

// Schema helpers

// export type IfNullable<S> = S extends SchemaDefault ? (S["nullable"] extends true ? null : never) : never
export type ExtractNameFromRef<P> = P extends `#/components/schemas/${infer T}` ? T : never
export type DeRefSchema<S extends SchemaRef, Context> = Context extends Schemas ? Context[ExtractNameFromRef<S["$ref"]>] : never

// export type GetSchemaByRef<Ref extends string, Schemas extends Record<string, Schema>> = Schemas[ExtractNameFromRef<Ref>]

// Swagger schema helpers 

// export type ExtendsOkResponseSample<T> = T extends OkResponseSample ? T : never
// export type ExtendsContentSample<T> = T extends ContentSample ? T : never

// export type FindMethodInPaths<M extends Lowercase<RequestMethod>, Paths> = keyof { [P in keyof Paths as (keyof Paths[P] extends Exclude<keyof Paths[P], M> ? never : P)]: unknown }
