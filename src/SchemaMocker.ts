
import { mapValues, random } from "lodash-es"

import SchemaContext from "./SchemaContext"
import ResolveSchema from "./type-resolver/resolver"
import { Schema, SchemaObject, SchemaObjectLike } from "./types"
import UnreachableCodeError from "./UnreachableCodeError"

interface Replacement {
  string?: (() => string) | string
  number?: (() => number) | number
  boolean?: (() => boolean) | boolean
  arraySize?: (() => number) | number
}

class SchemaMocker<Context extends Record<string, Schema> = {}> extends SchemaContext<Context> {
  // private static seenSchemas: WeakSet<Schema> = new WeakSet

  public static DEFAULT_REPLACEMENT = {
    string: "[missing value]",
    number: -1,
    boolean: () => Boolean(random(0, 1)),
    arraySize: () => random(1, 5)
  }

  private applyReplacement(replacement: unknown) {
    if (replacement instanceof Function) {
      return replacement()
    }

    return replacement
  }

  public mock<S extends Schema>(rootSchema: S, replacement: Replacement = SchemaMocker.DEFAULT_REPLACEMENT): ResolveSchema<S, Context> {
    const mock = (schema: Schema, replacement: Replacement, seenRefs: string[] = []): unknown => {
      if ("$ref" in schema) {
        if (seenRefs.includes(schema.$ref)) {
          return null
        }

        const deRefedSchema: Schema = this.deRef(schema)

        const mockedSchema = mock(deRefedSchema, replacement, [...seenRefs, schema.$ref])
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

        const arrayIndex = random(0, oneOf.length - 1)
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

      if ("properties" in schema) {
        return handleObject(schema)
      }

      function handleObject(schemaObject: SchemaObjectLike | SchemaObject) {
        const properties = mapValues(schemaObject.properties, value => mock(value, replacement, seenRefs))
        const additionalProperties = mapValues(schemaObject.additionalProperties, value => mock(value, replacement, seenRefs))

        return {
          ...properties,
          ...additionalProperties
        }
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
          const arrayItemsMocked = mock(schema.items, replacement, seenRefs)
          if (arrayItemsMocked == null) {
            return Array(arraySize)
          }

          return Array(arraySize).fill(arrayItemsMocked)
        }

        case "object": {
          if (schema.properties == null) {
            return {}
          }

          return handleObject(schema)
        }

        default:
          throw new UnreachableCodeError({ schema: schema })
      }
    }

    return mock(rootSchema, replacement) as never
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
