import _ from "lodash"
import { ValueOf } from "type-fest"
import { z, ZodType, ZodTypeAny } from "zod"

import SchemaContext from "./SchemaContext"
import SchemaMocker from "./SchemaMocker"
import ResolveSchema from "./type-resolver/resolver"
import { Schema } from "./types"
import UnreachableCodeError from "./UnreachableCodeError"

class SchemaView<T extends ValueOf<Context> | Schema, Context extends Record<string, Schema>> {
  private context: SchemaContext<Context>

  readonly zodType: ZodType<ResolveSchema<T, Context>>
  readonly mocked: ResolveSchema<T, Context>

  constructor(readonly schema: T, context?: Context) {
    this.context = new SchemaContext(context)

    this.zodType = this.toZod(this.schema)

    this.mocked = new SchemaMocker(context).mock(this.schema) as never
  }

  toZod(baseSchema: Schema): ZodTypeAny {
    const toZod = (schema: Schema): ZodTypeAny => {
      if ("$ref" in schema) {
        const deRefedSchema = this.context.deRef(schema)
        if (deRefedSchema === baseSchema) {
          return z.never()
        }

        return this.toZod(deRefedSchema)
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

  parse<S extends Schema>(value: unknown, schema: S): ResolveSchema<S, Context> {
    const zodType = this.toZod(schema)
    return zodType.parse(value)
  }
}

export default SchemaView
