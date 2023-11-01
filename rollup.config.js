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
    preserveModules: true,
    exports: "auto"
  },
})
const config = defineConfig([
  {
    ...baseConfig,
    plugins: [
      swc({
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
