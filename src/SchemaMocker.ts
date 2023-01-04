import _ from "lodash"

import SchemaContext from "./SchemaContext"
import { Schema } from "./types"
import UnreachableCodeError from "./UnreachableCodeError"

interface Replacement {
  string?: (() => string) | string
  number?: (() => number) | number
  boolean?: (() => boolean) | boolean
  arraySize?: (() => number) | number
}

class SchemaMocker<Context extends Record<string, Schema>> {
  private context: SchemaContext<Context>

  public static DEFAULT_REPLACEMENT: Replacement = {
    string: "[missing value]",
    number: -1,
    boolean: () => Boolean(_.random(0, 1)),
    arraySize: () => _.random(1, 5)
  }

  constructor(context?: Context) {
    this.context = new SchemaContext(context)
  }

  private applyReplacement(replacement: unknown) {
    if (replacement instanceof Function) {
      return replacement()
    }

    return replacement
  }

  public mock(baseSchema: Schema, replacement: Replacement = SchemaMocker.DEFAULT_REPLACEMENT): unknown {
    const mock = (schema: Schema, replacement: Replacement): unknown => {
      if ("$ref" in schema) {
        const deRefedSchema = this.context.deRef(schema)
        if (deRefedSchema === baseSchema) {
          return null
        }

        const mockedSchema = this.mock(deRefedSchema, replacement)
        return mockedSchema
      }

      if ("allOf" in schema) {
        return schema.allOf.reduce((result, nextSchema) => {
          const mockedSchema = mock(nextSchema, replacement)
          if (!(mockedSchema instanceof Object)) {
            return result
          }

          return { ...result, ...mockedSchema }
        }, {})
      }

      if ("anyOf" in schema || "oneOf" in schema) {
        const oneOf = "oneOf" in schema ? schema.oneOf : schema.anyOf

        const arrayIndex = _.random(0, oneOf.length - 1)
        const arrayItem = oneOf[arrayIndex]
        if (arrayItem == null) {
          return []
        }

        const mockedSchema = mock(arrayItem, replacement)
        return mockedSchema
      }


      if (schema.default) {
        return schema.default
      }

      switch (schema.type) {
        case "string":
          return this.applyReplacement(replacement.string)

        case "integer":
        case "number":
          return this.applyReplacement(replacement.number)

        case "boolean":
          return this.applyReplacement(replacement.boolean)

        case "array": {
          if (schema.items == null) {
            return []
          }

          const arraySize = this.applyReplacement(replacement.arraySize)
          const arrayItemsMocked = mock(schema.items, replacement)
          if (arrayItemsMocked == null) {
            return Array(arraySize)
          }

          return Array(arraySize).fill(arrayItemsMocked)
        }

        case "object": {
          if (schema.properties == null) {
            return {}
          }

          const properties = _.mapValues(schema.properties, value => mock(value, replacement))
          const additionalProperties = _.mapValues(schema.additionalProperties, value => mock(value, replacement))

          return {
            ...properties,
            ...additionalProperties
          }
        }

        default:
          throw new UnreachableCodeError({ schema })
      }
    }

    return mock(baseSchema, replacement)
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
