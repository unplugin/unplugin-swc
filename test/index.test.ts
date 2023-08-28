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
  })).rejects.toMatchInlineSnapshot(`
    [Error: 
      [38;2;255;30;30m×[0m Expression expected
       ╭─[[38;2;92;157;255;1;4m/Users/hanlee/Projects/unplugin/unplugin-swc/test/fixtures/read-tsconfig/index.tsx[0m:1:1]
     [2m1[0m │ function sealed(constructor: Function) {}
     [2m2[0m │ 
     [2m3[0m │ @sealed
       · [38;2;246;87;248m─[0m
     [2m4[0m │ export class BugReport {}
     [2m5[0m │ 
     [2m6[0m │ export const App = () => <div>hi</div>
       ╰────


    Caused by:
        Syntax Error]
  `)
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
