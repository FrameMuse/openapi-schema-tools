import { ZodError } from "zod"

import SchemaMocker from "./SchemaMocker"
import SchemaParser from "./SchemaParser"
import { Schema } from "./types"

describe("SchemaParser", () => {
  describe("parse()", () => {
    test("Failure", () => {
      const schemaParser = new SchemaParser()
      const schemaSample = { type: "object", properties: { b: { type: "string" } } } as const

      expect(() => schemaParser.parse({ a: 1 }, schemaSample)).toThrowError(ZodError)
    })

    test("Success", () => {
      const schemaParser = new SchemaParser()
      const schemaSample = { type: "object", properties: { b: { type: "string" } } } as const

      expect(schemaParser.parse({ b: "" }, schemaSample)).toEqual({ b: "" })
    })
  })

  describe("parsePartial()", () => {
    test("1", () => {
      const schemaParser = new SchemaParser()
      const schemaSample: Schema = { type: "object", properties: { b: { type: "string" } }, required: ["b"] }

      expect(schemaParser.parsePartial({ a: 1 }, schemaSample)).toEqual({})
    })

    test("2", () => {
      const schemaParser = new SchemaParser()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.parsePartial({ a: 1 }, schemaSample)).toEqual(undefined)
    })

    test("3", () => {
      const schemaParser = new SchemaParser()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.parsePartial([{ a: 1 }], schemaSample)).toEqual([{}])
    })
  })

  describe("parseMocked()", () => {
    test("1", () => {
      const schemaParser = new SchemaParser()
      const schemaSample: Schema = { type: "object", properties: { b: { type: "string" } }, required: ["b"] }

      expect(schemaParser.parseMocked({ a: 1 }, schemaSample)).toEqual({
        b: SchemaMocker.DEFAULT_REPLACEMENT.string
      })
    })

    test("2", () => {
      const schemaParser = new SchemaParser()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.parseMocked({ a: 1 }, schemaSample)).toContainEqual({ b: SchemaMocker.DEFAULT_REPLACEMENT.string })
    })

    test("3", () => {
      const schemaParser = new SchemaParser()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.parseMocked([{ a: 1 }], schemaSample)).toContainEqual({ b: SchemaMocker.DEFAULT_REPLACEMENT.string })
    })
  })
})
