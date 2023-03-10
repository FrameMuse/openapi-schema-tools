import _ from "lodash"

import SchemaContext from "./SchemaContext"
import ResolveSchema from "./type-resolver/resolver"
import { Schema } from "./types"
import UnreachableCodeError from "./UnreachableCodeError"

interface Replacement {
  string?: (() => string) | string
  number?: (() => number) | number
  boolean?: (() => boolean) | boolean
  arraySize?: (() => number) | number
}

class SchemaMocker<Context extends Record<string, Schema> = {}> extends SchemaContext<Context> {
  public static DEFAULT_REPLACEMENT = {
    string: "[missing value]",
    number: -1,
    boolean: () => Boolean(_.random(0, 1)),
    arraySize: () => _.random(1, 5)
  }

  private applyReplacement(replacement: unknown) {
    if (replacement instanceof Function) {
      return replacement()
    }

    return replacement
  }

  public mock<S extends Schema>(schema: S, replacement: Replacement = SchemaMocker.DEFAULT_REPLACEMENT): ResolveSchema<S, Context> {
    const mock = (nextSchema: Schema, replacement: Replacement): unknown => {
      if ("$ref" in nextSchema) {
        const deRefedSchema: Schema = this.deRef(nextSchema)
        if (deRefedSchema === schema) {
          return null
        }

        const mockedSchema = this.mock(deRefedSchema, replacement)
        return mockedSchema
      }

      if ("allOf" in nextSchema) {
        return nextSchema.allOf.reduce((result, nextSchema) => {
          const mockedSchema = mock(nextSchema, replacement)
          if (!(mockedSchema instanceof Object)) {
            return result
          }

          return { ...result, ...mockedSchema }
        }, {})
      }

      if ("anyOf" in nextSchema || "oneOf" in nextSchema) {
        const oneOf = "oneOf" in nextSchema ? nextSchema.oneOf : nextSchema.anyOf

        const arrayIndex = _.random(0, oneOf.length - 1)
        const arrayItem = oneOf[arrayIndex]
        if (arrayItem == null) {
          return []
        }

        const mockedSchema = mock(arrayItem, replacement)
        return mockedSchema
      }


      if (nextSchema.default) {
        return nextSchema.default
      }

      switch (nextSchema.type) {
        case "string":
          return this.applyReplacement(replacement.string)

        case "integer":
        case "number":
          return this.applyReplacement(replacement.number)

        case "boolean":
          return this.applyReplacement(replacement.boolean)

        case "array": {
          if (nextSchema.items == null) {
            return []
          }

          const arraySize = this.applyReplacement(replacement.arraySize)
          const arrayItemsMocked = mock(nextSchema.items, replacement)
          if (arrayItemsMocked == null) {
            return Array(arraySize)
          }

          return Array(arraySize).fill(arrayItemsMocked)
        }

        case "object": {
          if (nextSchema.properties == null) {
            return {}
          }

          const properties = _.mapValues(nextSchema.properties, value => mock(value, replacement))
          const additionalProperties = _.mapValues(nextSchema.additionalProperties, value => mock(value, replacement))

          return {
            ...properties,
            ...additionalProperties
          }
        }

        default:
          throw new UnreachableCodeError({ schema: nextSchema })
      }
    }

    return mock(schema, replacement) as never
  }

  private never(schema: Schema) {
    if ("$ref" in schema) {
      throw new Error("Can't deref here.")
    }

    if ("allOf" in schema) return {}
    if ("oneOf" in schema) return null
    if ("anyOf" in schema) return null

    switch (schema.type) {
      case "array": return []
      case "object": return {}

      default: return null
    }
  }
}

export default SchemaMocker
