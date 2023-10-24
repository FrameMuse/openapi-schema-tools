import compiler from "@ampproject/rollup-plugin-closure-compiler"
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"

import packageJson from "./package.json"

const external = Object.keys(packageJson.dependencies)

const config = [{
  input: "src/index.ts",
  output: [{ file: packageJson.main, format: "cjs", }],
  plugins: [typescript(), compiler()],
  external,
},
{
  input: "src/index.ts",
  output: [{ file: packageJson.types, format: "cjs" }],
  plugins: [dts()],
  external,
}]

export default config
