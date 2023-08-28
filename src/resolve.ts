import fs from 'fs'
import path from 'path'
import { pathExists } from 'path-exists'

const RESOLVE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs']

const resolveFile = async(resolved: string, index = false) => {
  for (const ext of RESOLVE_EXTENSIONS) {
    const file = index
      ? path.join(resolved, `index${ext}`)
      : `${resolved}${ext}`
    if (await pathExists(file)) return file
  }
}

export const resolveId = async(importee: string, importer?: string) => {
  if (importer && importee[0] === '.') {
    const absolutePath = path.resolve(
      importer ? path.dirname(importer) : process.cwd(),
      importee,
    )

    let resolved = await resolveFile(absolutePath)

    if (
      !resolved
      && (await pathExists(absolutePath))
      && (await fs.promises.stat(absolutePath).then(stat => stat.isDirectory()))
    ) {
      resolved = await resolveFile(absolutePath, true)
    }

    return resolved
  }
}
