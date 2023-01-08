import _ from "lodash"
import { PartialDeep } from "type-fest"
import { z, ZodArray, ZodObject, ZodTypeAny } from "zod"

import SchemaContext from "./SchemaContext"
import SchemaConverter from "./SchemaConverter"
import SchemaMocker from "./SchemaMocker"
import ResolveSchema from "./type-resolver/resolver"
import { Schema, Schemas } from "./types"

class SchemaSatisfier<Context extends Schemas = {}> extends SchemaContext<Context> {
  /**
   * If properties differ or unrecognized keys are met, a error will be thrown.
   */
  required<S extends Schema>(value: unknown, schema: S): ResolveSchema<S, Context> {
    const schemaConverter = new SchemaConverter(this.context)

    const zodType = schemaConverter.toZod(schema)
    return zodType.parse(value)
  }

  /**
   * Properties that differ and unrecognized keys will be removed.
   */
  partial<S extends Schema>(value: unknown, schema: S): PartialDeep<ResolveSchema<S, Context>> {
    function makePartial(zodType: ZodTypeAny): ZodTypeAny {
      if (zodType instanceof ZodArray) {
        return z.array(makePartial(zodType.element))
      }

      if (zodType instanceof ZodObject) {
        return zodType.partial()
      }

      return zodType.optional().nullish()
    }

    if ("$ref" in schema) {
      return this.partial(value, this.deRef(schema)) as never
    }

    if ("allOf" in schema) { return schema.allOf.map(schema => this.partial(value, schema)) as never }
    if ("oneOf" in schema) { return schema.oneOf.map(schema => this.partial(value, schema)) as never }
    if ("anyOf" in schema) { return schema.anyOf.map(schema => this.partial(value, schema)) as never }

    if (!(value instanceof Array) && schema.type === "array") {
      return undefined as never
    }

    if (typeof value !== "object" && schema.type === "object") {
      return undefined as never
    }

    const schemaConverter = new SchemaConverter(this.context)

    const zodType = schemaConverter.toZod(schema)
    return makePartial(zodType).parse(value) as never
  }

  /**
   * Properties that differ will be replaced with a mock. Unrecognized keys will be removed.
   */
  mocked<S extends Schema>(value: unknown, schema: S): ResolveSchema<S, Context> {
    const mocker = new SchemaMocker(this.context)

    const mocked = mocker.mock(schema)
    const partial = this.partial(value, schema)

    return _.merge(mocked, partial)
  }
}

// const schemaType = new SchemaType()
// schemaType.required({})

export default SchemaSatisfier
