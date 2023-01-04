import SchemaContext from "./SchemaContext"
import SchemaView from "./SchemaView"
import ResolveSchema from "./type-resolver/resolver"
import { Schema } from "./types"

class SchemaParser<Context extends Record<string, Schema>> extends SchemaContext<Context> {
  public parse<S extends Schema>(value: unknown, schema: S): ResolveSchema<S, Context> {
    const schemaView = new SchemaView(schema, this.context)
    return schemaView.zodType.parse(value)
  }
}

export default SchemaParser
