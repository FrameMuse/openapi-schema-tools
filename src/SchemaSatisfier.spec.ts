import { ZodError } from "zod"

import SchemaMocker from "./SchemaMocker"
import SchemaSatisfier from "./SchemaSatisfier"
import { Schema } from "./types"

describe("SchemaParser", () => {
  describe("parse()", () => {
    test("Failure", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample = { type: "object", properties: { b: { type: "string" } } } as const

      expect(() => schemaParser.required({ a: 1 }, schemaSample)).toThrowError(ZodError)
    })

    test("Success", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample = { type: "object", properties: { b: { type: "string" } } } as const

      expect(schemaParser.required({ b: "" }, schemaSample)).toEqual({ b: "" })
    })
  })

  describe("parsePartial()", () => {
    test("1", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample: Schema = { type: "object", properties: { b: { type: "string" } }, required: ["b"] }

      expect(schemaParser.partial({ a: 1 }, schemaSample)).toEqual({})
    })

    test("2", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.partial({ a: 1 }, schemaSample)).toEqual(undefined)
    })

    test("3", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.partial([{ a: 1 }], schemaSample)).toEqual([{}])
    })
  })

  describe("parseMocked()", () => {
    test("1", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample: Schema = { type: "object", properties: { b: { type: "string" } }, required: ["b"] }

      expect(schemaParser.mocked({ a: 1 }, schemaSample)).toEqual({
        b: SchemaMocker.DEFAULT_REPLACEMENT.string
      })
    })

    test("2", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.mocked({ a: 1 }, schemaSample)).toContainEqual({ b: SchemaMocker.DEFAULT_REPLACEMENT.string })
    })

    test("3", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      expect(schemaParser.mocked([{ a: 1 }], schemaSample)).toContainEqual({ b: SchemaMocker.DEFAULT_REPLACEMENT.string })
    })
  })
})
