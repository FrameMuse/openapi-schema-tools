import { mapValues } from "lodash-es"
import { array, boolean, intersection, never, number, object, string, union, ZodType, ZodTypeAny } from "zod"

import SchemaContext from "./SchemaContext"
import ResolveSchema from "./type-resolver/resolver"
import { Schema, Schemas } from "./types"
import UnreachableCodeError from "./UnreachableCodeError"

class SchemaConverter<Context extends Schemas = {}> extends SchemaContext<Context> {
  constructor(context?: Context, protected options?: { strict?: boolean }) {
    super(context)
  }
  
  toZod<S extends Schema>(schema: S): ZodType<ResolveSchema<S>> {
    // Rename to `baseSchema` to avoid confusion with `schema` parameter.
    const baseSchema = schema
    
    const toZod = (schema: Schema): ZodTypeAny => {
      if ("$ref" in schema) {
        const deRefedSchema: Schema = this.deRef(schema)
        if (deRefedSchema === baseSchema) {
          return never()
        }

        return this.toZod(deRefedSchema)
      }

      if ("allOf" in schema) {
        const items = schema.allOf.map(item => toZod(item))
        if (items.length < 2) {
          return items[0] || never()
        }

        const itemsIntersection = items.slice(1).reduce((result, next) => intersection(result, next), items[0] as ZodTypeAny)
        return itemsIntersection
      }
      if ("anyOf" in schema || "oneOf" in schema) {
        const anyOf = "anyOf" in schema ? schema.anyOf : schema.oneOf
        const items = anyOf.map(item => toZod(item))
        if (items.length < 2) {
          return items[0] || never()
        }

        const itemsUnion = union(items as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]])
        return itemsUnion
      }

      switch (schema.type) {
        case "string":
          return string()
        case "number":
        case "integer":
          return number()
        case "boolean":
          return boolean()

        case "array": {
          if (schema.items == null) {
            return array(never())
          }

          return array(toZod(schema.items))
        }

        case "object": {
          if (schema.properties == null) {
            return object({})
          }

          const properties = mapValues(schema.properties, toZod)
          const additionalProperties = mapValues(schema.additionalProperties, toZod)

          return object({ ...properties, ...additionalProperties })
        }

        default:
          throw new UnreachableCodeError({ schema })
      }
    }
    return toZod(baseSchema)
  }

  /**
   * Strict mode: 
   */
  static toZod<S extends Schema, Context extends Schemas>(schema: S, context?: Context, options?: { strict?: boolean }): ZodType<ResolveSchema<S>> {
    const schemaConverter = new SchemaConverter(context)
    return schemaConverter.toZod(schema)
  }
}

export default SchemaConverter
