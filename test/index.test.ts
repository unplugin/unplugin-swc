import path from 'path'
import { rollup } from 'rollup'
import { expect, test } from 'vitest'
import swc from '../dist'

const fixture = (...args: string[]) => path.join(__dirname, 'fixtures', ...args)

test('rollup', async() => {
  const bundle = await rollup({
    input: fixture('rollup/index.ts'),
    plugins: [
      swc.rollup({
        tsconfigFile: false,
      }),
    ],
  })

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('rollup/dist'),
  })

  expect(
    output[0].code,
  ).toMatchInlineSnapshot(`
    "'use strict';

    var foo = \\"foo\\";

    exports.foo = foo;
    "
  `)
})

test('read tsconfig', async() => {
  const bundle = await rollup({
    input: fixture('read-tsconfig/index.tsx'),
    plugins: [swc.rollup()],
  })

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('read-tsconfig/dist'),
  })

  const code = output[0].code
  expect(code).toMatch('customJsxFactory')

  // NOTE: use tsconfig.base.json which experimentalDecorators turned off will throw
  expect(rollup({
    input: fixture('read-tsconfig/index.tsx'),
    plugins: [swc.rollup({ tsconfigFile: 'tsconfig.base.json' })],
  })).rejects.toThrow('Syntax Error')
})

test('custom swcrc', async() => {
  const bundle = await rollup({
    input: fixture('custom-swcrc/index.tsx'),
    plugins: [
      swc.rollup({
        tsconfigFile: false,
      }),
    ],
  })

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('custom-swcrc/dist'),
  })

  const code = output[0].code
  expect(code).toMatch('customPragma')
})

test('minify', async() => {
  const bundle = await rollup({
    input: fixture('minify/index.ts'),
    plugins: [
      swc.rollup({
        minify: true,
      }),
    ],
  })

  const { output } = await bundle.generate({
    format: 'cjs',
    dir: fixture('minify/dist'),
  })

  const code = output[0].code
  expect(code).toMatchInlineSnapshot(`
    "\\"use strict\\";function _class_call_check(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError(\\"Cannot call a class as a function\\")}}function _define_property(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true})}else{obj[key]=value}return obj}var Foo=function Foo(){_class_call_check(this,Foo);_define_property(this,\\"a\\",void 0);this.a=1};exports.Foo=Foo;
    "
  `)
})
