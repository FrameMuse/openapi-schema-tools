export interface Schema3 extends SchemaDefault {
  type?: "array" | "object" | "boolean" | "number" | "integer" | "string"
  items?: Schema
  properties?: Record<string, Schema>
  additionalProperties?: Record<string, Schema>
  /**
   * List of required fields related to `properties` field.
   * @example ["field1", "field2"]
   */
  required?: string[]
  allOf?: Schema[]
  anyOf?: Schema[]
  oneOf?: Schema[]
  maxLength?: number
  format?: "int32" | "float" | "date" | "time" | "date-time" | "uri" | "email"
  minimum?: number
  maximum?: number

  /**
   * Represents union of possible `number` values.
   * The unions are joined by `|` sign.
   *
   * @example [0, 1, 2]
   */
  enum?: (string | number)[]
  $ref?: string
}

export interface SchemaArray extends SchemaDefault {
  type: "array"
  /**
   * Items that are represented by this `array`.
   */
  items?: Schema
}

export interface SchemaObject extends SchemaDefault {
  type: "object"
  properties?: Record<string, Schema>
  additionalProperties?: Record<string, Schema>
  /**
   * List of required fields related to `properties` field.
   * @example ["field1", "field2"]
   */
  required?: string[]
}

export interface SchemaNumber extends SchemaDefault {
  type: "integer" | "number"
  format?: "int32" | "float"
  minimum?: number
  maximum?: number

  /**
   * Represents union of possible `number` values.
   * The unions are joined by `|` sign.
   *
   * @example [0, 1, 2]
   */
  enum?: number[]
}

export interface SchemaString extends SchemaDefault {
  type: "string"
  format?: "date" | "time" | "date-time" | "uri" | "email"
  maxLength?: number
  /**
   * Represents union of possible `string` values.
   * The unions are joined by `|` sign.
   * 
   * @example ["guest", "user"]
   */
  enum?: string[]
}

export interface SchemaBoolean extends SchemaDefault {
  type: "boolean"
}

export interface SchemaAllOf extends SchemaDefault {
  /**
   * Represents union of possible values.
   * The unions are joined by `&` sign.
   * 
   * @example { foo: string } & { bar: number[] }
   * @example SchemaName1 & SchemaName2
   */
  allOf: Schema[]
}

export interface SchemaAnyOf extends SchemaDefault {
  /**
   * Represents union of possible values.
   * The unions are joined by `|` sign.
   * 
   * @example { foo: string } | { bar: number[] }
   * @example SchemaName1 & SchemaName2
   */
  anyOf: Schema[]
}

export interface SchemaOneOf extends SchemaDefault {
  /**
   * Represents union of possible values.
   * The unions are joined by `|` sign.
   * 
   * @example { foo: string } | { bar: number[] }
   * @example SchemaName1 & SchemaName2
   */
  oneOf: Schema[]
}

export interface SchemaRef {
  /**
   * Reference to another `Schema`.
   * 
   * @example "#/components/schemas/SchemaName"
   */
  $ref: string
}

export interface SchemaDefault {
  title?: string
  description?: string

  writeOnly?: boolean
  readOnly?: boolean
  /**
   * Default value of the `Schema`.
   */
  default?: unknown
  /**
   * Means that the value of the `Schema` may be `null`.
   */
  nullable?: boolean
}

export type Schema = SchemaArray | SchemaObject | SchemaNumber | SchemaString | SchemaBoolean | SchemaRef | SchemaAllOf | SchemaAnyOf | SchemaOneOf

export interface Parameter {
  name: string
  in: "path" | "query"
  required?: boolean
  style?: "simple" | "form"
  explode?: boolean
  schema: Schema
  description?: string
}

export type PathMethod = Record<string, {
  description?: string
  parameters?: Parameter[]
  requestBody?: {
    content: Record<string, { schema: Schema }>
  }
  responses: Record<string, {
    content?: Record<string, { schema: Schema }>
    description?: string | null
  }>
}>

export type Paths = Record<string, PathMethod>
export type Schemas = Record<string, Schema>

export type PathArgs = Record<string, Omit<Parameter, "required" | "schema"> & { required: boolean, schemaType: string }>

export type RequestMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"

// Samples (for extending)

export interface OkResponseSample {
  responses: Record<string | number, ContentSample>
}

export interface ContentSample {
  content: {
    "application/json": {
      schema: Schema
    }
  }
}

export interface SwaggerDocs {
  openapi: string
  paths: Paths
  components: {
    schemas: Schemas
    // securitySchemes: Schemas
  }
}



export class UnreachableCodeError extends Error {
  constructor(details: unknown) {
    super("Unreachable code reached with these details: " + String(details))

    this.name = UnreachableCodeError.name
  }
}
