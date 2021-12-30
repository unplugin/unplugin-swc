import fs from 'fs'
import path from 'path'
import { parse } from 'jsonc-parser'
import JoyCon from 'joycon'

const joycon = new JoyCon()

joycon.addLoader({
  test: /\.json$/,
  async load(filepath: string) {
    const content = await fs.promises.readFile(filepath, 'utf8')
    return parse(content)
  },
})

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
