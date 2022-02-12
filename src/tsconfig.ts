import path from 'path'
import JoyCon from 'joycon'
import { loadTsConfig } from 'load-tsconfig'

const joycon = new JoyCon()

joycon.addLoader({
  test: /\.json$/,
  load(filepath: string) {
    const loaded = loadTsConfig(path.dirname(filepath))
    return loaded?.data;
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
