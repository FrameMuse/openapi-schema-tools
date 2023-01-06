import { ValueOf } from "type-fest"

import { SchemaRef, Schemas } from "./types"

class SchemaContext<Context extends Schemas = {}> {
  constructor(protected context?: Context) { }

  /**
   * Resolves (derefs) **local** references.
   */
  public deRef<S extends ValueOf<Context>>(schemaRef: SchemaRef): S {
    return SchemaContext.deRef(schemaRef, this.context)
  }

  /**
   * Get a schema by its name in the given context.
   */
  public getByName<K extends keyof Context>(key: K): Context[K] {
    return SchemaContext.getByName(key, this.context)
  }

  public static deRef<S extends ValueOf<Context>, Context extends Schemas>(schemaRef: SchemaRef, context?: Context): S {
    // 21 is a length of "#/components/schemas/"
    const schemaName = schemaRef.$ref.slice(21)
    return this.getByName(schemaName, context) as S
  }

  public static getByName<Context extends Schemas, K extends keyof Context>(key: K, context?: Context): Context[K] {
    if (context == null) {
      throw new Error("Can't resolve $ref without schemas context.")
    }

    if (context[key] == null) {
      throw new Error(`Can't resolve $ref: couldn't find ${String(key)}.`)
    }

    return context[key]
  }
}

export default SchemaContext
