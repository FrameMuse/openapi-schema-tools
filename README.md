# OpenAPI Schema Tools

## Motivation

OpenAPI Schema tools are split into many different libraries that are owned and maintained by different people, they are all different, work differently, only prodive specific function, some of them are inefficient and have a big bundle size.

## Description

Light weight library

Provides tools such as:
- `SchemaMocker` - Creates mocks from a given schema.
- `SchemaContext` - Creates schemas context providing `deRef` method.
- `SchemaSatisfier` - Prodives methods to ensure that given value satisfies given schema.
- `SchemaConverter` - Converts schema to another type (currenly only to [zod](https://zod.dev/)).

Types:
- `SchemaInfer` - A namespace that provides tools for infering schema from parts of OpenAPI Document.
- `SchemaResolve` - A namespace that provides tools for resolving different schema types.
- `ResolveSchema` - A type that resolves any schema (including `$ref`'s) deeply into a primitive.
