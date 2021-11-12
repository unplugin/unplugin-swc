import { createUnplugin } from 'unplugin'
import { transform, JscConfig, Options as SwcOptions } from '@swc/core'
import { resolveId } from './resolve'
import { getCompilerOptions } from './tsconfig'

export type Options = SwcOptions & { tsconfigFile?: string | boolean }

export default createUnplugin(
  ({ tsconfigFile, minify, ...options }: Options = {}) => {
    return {
      name: 'swc',

      resolveId,

      async transform(code, id) {
        const compilerOptions =
          tsconfigFile === false
            ? {}
            : await getCompilerOptions(
                id,
                tsconfigFile === true ? undefined : tsconfigFile,
              )

        const isTs = /\.tsx?$/.test(id)

        const jsc: JscConfig = {
          parser: {
            syntax: isTs ? 'typescript' : 'ecmascript',
          },
          transform: {},
        }

        if (compilerOptions.jsx) {
          Object.assign(jsc.parser, {
            [isTs ? 'tsx' : 'jsx']: true,
          })
          Object.assign(jsc.transform, {
            react: {
              pragma: compilerOptions.jsxFactory,
              pragmaFrag: compilerOptions.jsxFragmentFactory,
              importSource: compilerOptions.jsxImportSource,
            },
          })
        }

        if (compilerOptions.experimentalDecorators) {
          // class name is required by type-graphql to generate correct graphql type
          jsc.keepClassNames = true
          Object.assign(jsc.parser, {
            decorators: true,
          })
          Object.assign(jsc.transform, {
            legacyDecorator: true,
            decoratorMetadata: compilerOptions.emitDecoratorMetadata,
          })
        }

        const result = await transform(code, {
          filename: id,
          sourceMaps: true,
          ...options,
          jsc,
        })
        return {
          code: result.code,
          map: result.map && JSON.parse(result.map),
        }
      },

      vite: {
        config() {
          return {
            esbuild: false,
          }
        },
      },

      rollup: {
        async renderChunk(code) {
          if (minify) {
            const result = await transform(code, {
              sourceMaps: true,
              minify: true,
            })
            return {
              code: result.code,
              map: result.map,
            }
          }
          return null
        },
      },
    }
  },
)
