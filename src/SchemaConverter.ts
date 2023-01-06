import _ from "lodash"
import { z, ZodType, ZodTypeAny } from "zod"

import SchemaContext from "./SchemaContext"
import ResolveSchema from "./type-resolver/resolver"
import { Schema, Schemas } from "./types"
import UnreachableCodeError from "./UnreachableCodeError"

class SchemaConverter<Context extends Schemas = {}> extends SchemaContext<Context> {
  toZod<S extends Schema>(schema: S): ZodType<ResolveSchema<S>> {
    return SchemaConverter.toZod(schema, this.context)
  }

  static toZod<S extends Schema, Context extends Schemas>(baseSchema: S, context?: Context): ZodType<ResolveSchema<S>> {
    const schemaContext = new SchemaContext(context)

    const toZod = (schema: Schema): ZodTypeAny => {
      if ("$ref" in schema) {
        const deRefedSchema: Schema = schemaContext.deRef(schema)
        if (deRefedSchema === baseSchema) {
          return z.never()
        }

        return this.toZod(deRefedSchema, context)
      }

      if ("allOf" in schema) {
        const items = schema.allOf.map(item => toZod(item))
        if (items.length < 2) {
          return items[0] || z.never()
        }

        const intersection = items.slice(1).reduce((result, next) => z.intersection(result, next), items[0] as ZodTypeAny)
        return intersection
      }
      if ("anyOf" in schema || "oneOf" in schema) {
        const oneOf = "oneOf" in schema ? schema.oneOf : schema.anyOf
        const items = oneOf.map(item => toZod(item))
        if (items.length < 2) {
          return items[0] || z.never()
        }

        const union = z.union(items as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]])
        return union
      }

      switch (schema.type) {
        case "string":
          return z.string()
        case "number":
        case "integer":
          return z.number()
        case "boolean":
          return z.boolean()

        case "array": {
          if (schema.items == null) {
            return z.array(z.never())
          }

          return z.array(toZod(schema.items))
        }

        case "object": {
          if (schema.properties == null) {
            return z.object({})
          }

          const properties = _.mapValues(schema.properties, value => toZod(value))
          const additionalProperties = _.mapValues(schema.additionalProperties, value => toZod(value))

          return z.object({ ...properties, ...additionalProperties })
        }

        default:
          throw new UnreachableCodeError({ schema })
      }
    }
    return toZod(baseSchema)
  }
}

export default SchemaConverter
