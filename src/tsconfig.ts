import fs from 'fs'
import path from 'path'
import { parse } from 'jsonc-parser'
import JoyCon from 'joycon'

const joycon = new JoyCon()

joycon.addLoader({
  test: /\.json$/,
  load(filepath: string) {
    return readTsconfig(filepath)
  },
})

const readTsconfig = async (filepath: string) => {
  const content = await fs.promises.readFile(filepath, 'utf8')
  const parsed = parse(content) || {}

  parsed.compilerOptions = parsed.compilerOptions || {}

  if (typeof parsed.extends === 'string') {
    const rpath = path.resolve(path.dirname(filepath), parsed.extends)
    const parent = await readTsconfig(rpath)
    parsed.compilerOptions = Object.assign(parent.compilerOptions, parsed.compilerOptions)
  }

  return parsed;
}

export const getCompilerOptions = async (
  file: string,
  _tsconfigPath?: string,
) => {
  const { data } = await joycon.load(
    [_tsconfigPath || 'tsconfig.json'],
    path.dirname(file),
  )

  return data?.compilerOptions || {}
}
