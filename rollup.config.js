import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import typescript from 'rollup-plugin-typescript2'

const createBabelConfig = require('./babel.config')
const { root } = path.parse(process.cwd())
const external = (id) => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.js', '.ts', '.tsx']
const getBabelOptions = (targets) => {
  const config = createBabelConfig({ env: (env) => env === 'build' }, targets)
  if (targets.ie) {
    config.plugins = [
      ...config.plugins,
      '@babel/plugin-transform-regenerator',
      ['@babel/plugin-transform-runtime', { helpers: true, regenerator: true }],
    ]
  }
  return {
    ...config,
    runtimeHelpers: targets.ie,
    extensions,
  }
}

const createESMConfig = (output) => ({
  input: "src/index.ts",
  output: { file: output, format: 'esm' },
  external,
  plugins: [
    typescript(),
    babel(getBabelOptions({ node: 8 })),
    sizeSnapshot(),
    resolve({ extensions }),
  ],
})

function createCommonJSConfig(output) {
  return {
    input: "src/index.ts",
    output: { file: output, format: 'cjs', exports: 'named' },
    external,
    plugins: [
      typescript(),
      babel(getBabelOptions({ ie: 11 })),
      sizeSnapshot(),
      resolve({ extensions }),
    ],
  }
}

export default [
  createESMConfig("dist/index.js"),
  createESMConfig("examples/src/apollo-reactive-store.js"),
  createCommonJSConfig("dist/index.cjs.js")
]