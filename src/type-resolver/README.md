# OpenAPI Swagger Schema TypeScript Mapping, Parser

Reduces (or parses or maps) OpenAPI Swagger Schema to interface (or type) saving links to origin.

## Motivation

I am a laziest person ever, I never wanted to write a bit of `boilerplate code`.
I dreamed of having a parser of `Swagger schema`, so I just download it once and I have all `actions` (or path or endpoints) in one place.
In the beginning, I wrote all endpoints manually, then I wrote [this parser](https://github.com/FrameMuse/universal-swagger-exporter) to parse to `Actions.ts` and `Schemas.ts` files, that was enough for that time.

But I was tired of importing each one action every time I wanted to use it and I also got some other problems with having separate declarations. I just wanted to pick an endpoint from `suggestions menu` and it would infer all the data automatically.

So I came to writing a TypeScript mapping of Swagger schema, so I only need that json file and that's it.

But unfortunately this parser has a problem too - it can't work with pure json file, the file needs to be put into ts interface (or type) [so it holds string literal].

## Main Usage

API endpoints - See usage in `usage.ts`.

## After word

_The typings are still not perfect._

I hope somebody will ever need this.
I believe that I made something great so far but I will test through out this year and see how it behaves.

I will also create automatic "transformer" of field names from snake case to camel and evaluation of date strings to `Date` class and others.

Author - [me](https://github.com/FrameMuse)
