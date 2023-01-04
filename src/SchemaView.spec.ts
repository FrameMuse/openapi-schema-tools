import { performance } from "node:perf_hooks"

import { ZodArray, ZodBoolean, ZodNever, ZodNumber, ZodObject, ZodString } from "zod"

import SchemaView from "./SchemaView"
import { SchemaSampleJson } from "./type-resolver/schema.json"
import { UnreachableCodeError } from "./types"

describe("SchemaView", () => {
  test("parse()", () => {
    const context = SchemaSampleJson.components.schemas
    const view = new SchemaView(context.AdminCreateArticle, context)

    expect(view.parse(view.mocked, view.schema)).toEqual(view.zodType.parse(view.mocked))
    expect(view.zodType.parse(view.mocked)).toEqual(view.mocked)
  })

  describe("toZod()", () => {
    test("string", () => {
      const view = new SchemaView({ type: "string" })
      expect(view.zodType).toBeInstanceOf(ZodString)
    })

    test("number", () => {
      const view = new SchemaView({ type: "number" })
      expect(view.zodType).toBeInstanceOf(ZodNumber)
    })

    test("integer", () => {
      const view = new SchemaView({ type: "integer" })
      expect(view.zodType).toBeInstanceOf(ZodNumber)
    })

    test("boolean", () => {
      const view = new SchemaView({ type: "boolean" })
      expect(view.zodType).toBeInstanceOf(ZodBoolean)
    })

    test("array", () => {
      const view = new SchemaView({ type: "array", items: { type: "string" } })
      expect(view.zodType).toBeInstanceOf(ZodArray)
    })
    test("array empty", () => {
      const view = new SchemaView({ type: "array" })
      expect((view.zodType as ZodArray<ZodNever>).element).toBeInstanceOf(ZodNever)
    })
    test("array element", () => {
      const view = new SchemaView({ type: "array", items: { type: "string" } })
      expect((view.zodType as ZodArray<ZodString>).element).toBeInstanceOf(ZodString)
    })

    test("object", () => {
      const view = new SchemaView({ type: "object", properties: { test: { type: "string" } } })
      expect(view.zodType).toBeInstanceOf(ZodObject)
    })
    test("object empty", () => {
      const view = new SchemaView({ type: "object" })
      expect((view.zodType as ZodObject<{}>).shape).toEqual({})
    })
    test("object shape", () => {
      const view = new SchemaView({ type: "object", properties: { test: { type: "string" } } })
      expect((view.zodType as ZodObject<{ test: ZodString }>).shape.test).toBeInstanceOf(ZodString)
    })

    test("Unreachable code", () => {
      expect(() => new SchemaView({} as never)).toThrowError(UnreachableCodeError)
    })

    describe("General Perfomance", () => {
      test("Single run (< 1 ms)", () => {
        const context = SchemaSampleJson.components.schemas
        const view = new SchemaView(context.BlogListComment, context)

        performance.mark("start")
        view.toZod(context.BlogListComment)
        performance.mark("end")

        const measure = performance.measure("single convertation", "start", "end")
        expect(measure.duration).toBeLessThan(1)
      })

      test("Multiple runs (< 10 ms)", () => {
        const context = SchemaSampleJson.components.schemas
        const view = new SchemaView(context.AdminCreateArticle, context)

        performance.mark("start")
        Object.values(context).forEach(schema => view.toZod(schema))
        performance.mark("end")

        const measure = performance.measure("multiple convertation", "start", "end")
        expect(measure.duration).toBeLessThan(10)
      })
    })


  })
})
