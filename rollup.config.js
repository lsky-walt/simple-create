const path = require('path')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')

export default {
  input: "./src/index.js",
  output: {
    "file": path.join(__dirname, 'lib/index.js'),
    format: 'cjs'
  },
  plugins: [
    nodeResolve(),
    commonjs()
  ]
}