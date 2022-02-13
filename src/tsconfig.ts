import path from 'path'
import { loadTsConfig } from 'load-tsconfig'

export const getCompilerOptions = (
  file: string,
  _tsconfigPath?: string,
) => {
  const filepath = path.join(path.dirname(file), _tsconfigPath || 'tsconfig.json')
  const loaded = loadTsConfig(filepath)
  return loaded?.data?.compilerOptions || {}
}
