import { ZodArray, ZodBoolean, ZodNever, ZodNumber, ZodObject, ZodString } from "zod"

import SchemaConverter from "../SchemaConverter"
import SchemaMocker from "../SchemaMocker"
import { SchemaSampleJson } from "./schema.json"

describe("SchemaConverter", () => {
  // test("parse()", () => {
  //   const context = SchemaSampleJson.components.schemas
  //   const converter = new SchemaConverter(context)

  //   expect(converter.parse(converter.mocked, converter.schema)).toEqual(converter.zodType.parse(converter.mocked))
  //   expect(converter.zodType.parse(converter.mocked)).toEqual(converter.mocked)
  // })

  describe("toZod()", () => {
    test("string", () => {
      const converter = new SchemaConverter()
      expect(converter.toZod({ type: "string" })).toBeInstanceOf(ZodString)
    })

    test("number", () => {
      const converter = new SchemaConverter()
      expect(converter.toZod({ type: "number" })).toBeInstanceOf(ZodNumber)
    })

    test("integer", () => {
      const converter = new SchemaConverter()
      expect(converter.toZod({ type: "integer" })).toBeInstanceOf(ZodNumber)
    })

    test("boolean", () => {
      const converter = new SchemaConverter()
      expect(converter.toZod({ type: "boolean" })).toBeInstanceOf(ZodBoolean)
    })

    test("array", () => {
      const converter = new SchemaConverter()
      expect(converter.toZod({ type: "array", items: { type: "string" } })).toBeInstanceOf(ZodArray)
    })
    test("array empty", () => {
      const converter = new SchemaConverter()
      expect((converter.toZod({ type: "array" }) as ZodArray<ZodNever>).element).toBeInstanceOf(ZodNever)
    })
    test("array element", () => {
      const converter = new SchemaConverter()
      expect((converter.toZod({ type: "array", items: { type: "string" } }) as ZodArray<ZodString>).element).toBeInstanceOf(ZodString)
    })

    test("object", () => {
      const converter = new SchemaConverter()
      expect(converter.toZod({ type: "object", properties: { test: { type: "string" } } })).toBeInstanceOf(ZodObject)
    })
    test("object empty", () => {
      const converter = new SchemaConverter()
      expect((converter.toZod({ type: "object" }) as ZodObject<{}>).shape).toEqual({})
    })
    test("object shape", () => {
      const converter = new SchemaConverter()
      expect((converter.toZod({ type: "object", properties: { test: { type: "string" } } }) as ZodObject<{ test: ZodString }>).shape.test).toBeInstanceOf(ZodString)
    })

    test("recursive", () => {
      const converter = new SchemaConverter(SchemaSampleJson.components.schemas as never)
      const schema = SchemaSampleJson.components.schemas.BlogListComment as never
      const schemaConverted = converter.toZod(schema)

      const DEFAULT = {
        ...SchemaMocker.DEFAULT_REPLACEMENT,
        boolean: false,
        arraySize: 1
      }
      const expected = {
        author: {
          avatar: DEFAULT.string,
          first_name: DEFAULT.string,
          id: DEFAULT.number,
          last_name: DEFAULT.string,
        },
        created_at: DEFAULT.string,
        id: DEFAULT.number,
        is_deleted: DEFAULT.boolean,
        replies: [],
        text: DEFAULT.string,
      }

      const parsedValue1 = schemaConverted.parse({ ...expected, replies: [expected] })
      expect(parsedValue1).toEqual(parsedValue1)

      const parsedValue2 = schemaConverted.parse({ ...expected, replies: undefined })
      expect(parsedValue2).toEqual(parsedValue2)
    })

    // describe("General Perfomance", () => {
    //   test("Single run (< 1 ms)", () => {
    //     const schemaDocs = new SchemaDocs(SchemaSampleJson)
    //     const context = schemaDocs.components.schemas
    //     const converter = new SchemaConverter(context)


    //     performance.mark("start")
    //     converter.toZod(context.BlogListComment)
    //     performance.mark("end")

    //     const measure = performance.measure("single convertation", "start", "end")
    //     expect(measure.duration).toBeLessThan(1)
    //   })

    //   test("Multiple runs (< 10 ms)", () => {
    //     const schemaDocs = new SchemaDocs(SchemaSampleJson)
    //     const context = schemaDocs.components.schemas
    //     const converter = new SchemaConverter(context)

    //     performance.mark("start")
    //     Object.values(context).forEach(schema => converter.toZod(schema))
    //     performance.mark("end")

    //     const measure = performance.measure("multiple convertation", "start", "end")
    //     expect(measure.duration).toBeLessThan(10)
    //   })
    // })


  })
})
