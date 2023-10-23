import { ZodError } from "zod"

import SchemaMocker from "../SchemaMocker"
import SchemaSatisfier from "../SchemaSatisfier"
import { Schema } from "../types"

/**
 * Helps prevent error logs blowing up as a result of expecting an error to be thrown,
 * when using a library (such as enzyme)
 *
 * @param fn Function that you would normally pass to `expect(func).toThrow()`
 */
export function expectToThrow(fn: () => unknown, error?: Parameters<jest.Matchers<void>["toThrow"]>[0]): void {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  const spy = jest.spyOn(console, "error")
  spy.mockImplementation(() => void 0)

  expect(fn).toThrow(error)

  spy.mockRestore()
}

describe("SchemaParser", () => {
  describe("parse()", () => {
    test("Failure", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample = { type: "object", properties: { b: { type: "string" } } } as const

      expectToThrow(() => schemaParser.required({ a: 1 }, schemaSample), ZodError)
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

      schemaParser.mocked({ a: 1 }, schemaSample).forEach(parsedValue => {
        expect(parsedValue).toEqual({ b: SchemaMocker.DEFAULT_REPLACEMENT.string })
      })
    })

    test("3", () => {
      const schemaParser = new SchemaSatisfier()
      const schemaSample: Schema = {
        type: "array",
        items: { type: "object", properties: { b: { type: "string" } }, required: ["b"] }
      }

      schemaParser.mocked([{ a: 1 }], schemaSample).forEach(parsedValue => {
        expect(parsedValue).toEqual({ b: SchemaMocker.DEFAULT_REPLACEMENT.string })
      })
    })
  })
})
