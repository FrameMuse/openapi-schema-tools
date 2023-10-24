export interface SchemaAny extends SchemaDefault {
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
  format?: SchemaString["format"] | SchemaNumber["format"]
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
export interface SchemaObjectLike extends SchemaDefault {
  type?: "object"
  properties: Record<string, Schema>
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
  format?: "date" | "time" | "date-time" | "uri" | "email" | "binary"
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

export type Schema = SchemaArray | (SchemaObject | SchemaObjectLike) | SchemaNumber | SchemaString | SchemaBoolean | SchemaRef | SchemaAllOf | SchemaAnyOf | SchemaOneOf

export interface SchemaParameter {
  name: string
  in: "path" | "query"
  required?: boolean
  style?: "simple" | "form"
  explode?: boolean
  schema: Schema
  description?: string
}

export type SchemaPathMethods = Record<string, {
  description?: string
  parameters?: SchemaParameter[]
  requestBody?: SchemaContent
  responses?: Record<string, {
    content?: Record<string, { schema?: Schema }>
    description?: string | null
  }>
}>

export type Paths = Record<keyof never, SchemaPathMethods>
export type Schemas = Record<keyof never, Schema>

export type RequestMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"

// Samples (for extending)

export interface SchemaRequest {
  requestBody: SchemaContent
}

export interface SchemaContent<K extends string = string> {
  content: Record<K, { schema: Schema }>
}

export interface SchemaResponses<K extends string | number = string | number> {
  responses: Record<K, SchemaContent>
}

export interface SwaggerDocs {
  openapi: string
  paths: Paths
  components: {
    schemas: Schemas
    // securitySchemes?: Schemas
  }
}
