import { defineConfig } from "rollup"
import { swc } from "rollup-plugin-swc3"

const baseConfig = defineConfig({
  treeshake: true,
  external: [/react.*/, /@swc\/helpers\/.*/, /lodash.*/, "zod"],
  input: "./src/index.ts",
  output: {
    format: "esm",
    dir: "dist",
    sourcemap: true,
    preserveModules: false,
    exports: "auto"
  },
})
const config = defineConfig([
  {
    ...baseConfig,
    plugins: [
      swc({
        sourceMaps: true,
        jsc: {
          loose: true,
          externalHelpers: false,
          parser: {
            syntax: "typescript",
            dynamicImport: true
          },
          minify: {
            sourceMap: true
          }
        },
        minify: true
      })
    ]
  }
])

export default config
