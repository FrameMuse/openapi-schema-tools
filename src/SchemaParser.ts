import _ from "lodash"
import { PartialDeep } from "type-fest"
import { z, ZodArray, ZodObject, ZodTypeAny } from "zod"

import SchemaConverter from "./SchemaConverter"
import SchemaMocker from "./SchemaMocker"
import ResolveSchema from "./type-resolver/resolver"
import { Schema, Schemas } from "./types"

class SchemaParser<Context extends Schemas = {}> extends SchemaConverter<Context> {
  parse<S extends Schema>(value: unknown, schema: S): ResolveSchema<S, Context> {
    const zodType = this.toZod(schema)
    return zodType.parse(value)
  }

  /**
   * Properties that differ will be deleted.
   */
  parsePartial<S extends Schema>(value: unknown, schema: S): PartialDeep<ResolveSchema<S, Context>> {
    function partial(zodType: ZodTypeAny): ZodTypeAny {
      if (zodType instanceof ZodArray) {
        return z.array(partial(zodType.element))
      }

      if (zodType instanceof ZodObject) {
        return zodType.partial()
      }

      return zodType.optional().nullish()
    }

    if ("$ref" in schema) {
      return this.parsePartial(value, this.deRef(schema)) as never
    }

    if ("allOf" in schema) { return schema.allOf.map(schema => this.parsePartial(value, schema)) as never }
    if ("oneOf" in schema) { return schema.oneOf.map(schema => this.parsePartial(value, schema)) as never }
    if ("anyOf" in schema) { return schema.anyOf.map(schema => this.parsePartial(value, schema)) as never }

    if (!(value instanceof Array) && schema.type === "array") {
      return undefined as never
    }

    if (typeof value !== "object" && schema.type === "object") {
      return undefined as never
    }


    const zodType = this.toZod(schema)
    return partial(zodType).parse(value) as never
  }

  /**
   * Properties that differ will be mocked.
   */
  parseMocked<S extends Schema>(value: unknown, schema: S): ResolveSchema<S, Context> {
    const mocker = new SchemaMocker(this.context)

    const mocked = mocker.mock(schema)
    const partial = this.parsePartial(value, schema)

    return _.merge(mocked, partial)
  }
}

export default SchemaParser
