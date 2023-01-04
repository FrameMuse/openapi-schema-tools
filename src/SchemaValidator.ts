import SchemaContext from "./SchemaContext"
import { Schema } from "./types"

class SchemaValidator<Context extends Record<string, Schema>> extends SchemaContext<Context> {
  /**
   * Validates if the schema is written by the [OpenAPI Specification](https://spec.openapis.org/oas/latest.html#schema).
   */
  public validate(schema: Schema): void {
    throw new Error("Not implemented.", { cause: { schema } })
  }
}

export default SchemaValidator
