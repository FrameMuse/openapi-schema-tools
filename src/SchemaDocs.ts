import { ReadonlyDeep } from "type-fest"
import { WritableDeep } from "type-fest/source/writable-deep"

import ResolveSchema from "./type-resolver/resolver"
import { SwaggerDocs } from "./types"

interface SchemaDocsComponents<Docs extends SwaggerDocs> {
  schemas: Docs["components"]["schemas"]
  /**
   * Only for typization.
   */
  _resolvedSchemas: { [K in keyof this["schemas"]]: ResolveSchema<this["schemas"][K], this["schemas"]> }
}

class SchemaDocs<Docs extends SwaggerDocs | ReadonlyDeep<SwaggerDocs>> implements SwaggerDocs {
  openapi: Docs["openapi"]
  paths: WritableDeep<Docs["paths"]>
  // /**
  //  * Only for typization.
  //  */
  // _resolvedPaths!: {
  //   [Path in keyof this["paths"]]: {
  //     [Method in keyof this["paths"][Path]]: Omit<this["paths"][Path][Method], ""> & {

  //     }
  //   }
  // }
  components: SchemaDocsComponents<WritableDeep<Docs>>

  constructor(docs: Docs) {
    this.openapi = docs.openapi
    this.paths = docs.paths as never
    this.components = {
      schemas: docs.components.schemas as never,
      _resolvedSchemas: undefined as never
    }
  }
}

export default SchemaDocs
