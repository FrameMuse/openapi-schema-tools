import { mapValues } from "lodash-es"
import { array, boolean, custom, intersection, never, number, object, string, union, ZodType, ZodTypeAny } from "zod"

import SchemaContext from "./SchemaContext"
import ResolveSchema from "./type-resolver/resolver"
import { Schema, SchemaObject, SchemaObjectLike, Schemas } from "./types"
import UnreachableCodeError from "./UnreachableCodeError"

class SchemaConverter<Context extends Schemas = {}> extends SchemaContext<Context> {
  constructor(context?: Context, protected options?: { strict?: boolean }) {
    super(context)
  }

  toZod<S extends Schema>(rootSchema: S): ZodType<ResolveSchema<S>> {
    const toZod = (schema: Schema, seenRefs = new Map<string, ZodTypeAny>()): ZodTypeAny => {
      if ("$ref" in schema) {
        const oldZodSchema = seenRefs.get(schema.$ref)
        if (oldZodSchema != null) return oldZodSchema


        const deRefedSchema: Schema = this.deRef(schema)

        const refZodSchema = custom((...args) => toZod(deRefedSchema, seenRefs).parse(...args))
        seenRefs.set(schema.$ref, refZodSchema)
        return refZodSchema
      }

      if ("allOf" in schema) {
        const items = schema.allOf.map(item => toZod(item, seenRefs))
        if (items.length < 2) {
          return items[0] || never()
        }

        const itemsIntersection = items.slice(1).reduce((result, next) => intersection(result, next), items[0] as ZodTypeAny)
        return itemsIntersection
      }
      if ("anyOf" in schema || "oneOf" in schema) {
        const anyOf = "anyOf" in schema ? schema.anyOf : schema.oneOf
        const items = anyOf.map(item => toZod(item, seenRefs))
        if (items.length < 2) {
          return items[0] || never()
        }

        const itemsUnion = union(items as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]])
        return itemsUnion
      }

      if ("properties" in schema) {
        return handleObject(schema)
      }

      function handleObject(schemaObject: SchemaObjectLike | SchemaObject) {
        const properties = mapValues(schemaObject.properties, value => toZod(value, seenRefs))
        const additionalProperties = mapValues(schemaObject.additionalProperties, value => toZod(value, seenRefs))

        return object({ ...properties, ...additionalProperties })
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

          return array(toZod(schema.items, seenRefs))
        }

        case "object": {
          if (schema.properties == null) {
            return object({})
          }

          return handleObject(schema)
        }

        default:
          throw new UnreachableCodeError({ schema })
      }
    }
    return toZod(rootSchema)
  }

  /**
   * Strict mode: 
   */
  static toZod<S extends Schema, Context extends Schemas>(schema: S, context?: Context): ZodType<ResolveSchema<S>> {
    const schemaConverter = new SchemaConverter(context)
    return schemaConverter.toZod(schema)
  }
}

export default SchemaConverter
