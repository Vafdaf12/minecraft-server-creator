import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";


export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs"
  },
  plugins: [
    typescript(),
    json(),
    commonjs(),
    nodeResolve(),
    terser()
  ]
}