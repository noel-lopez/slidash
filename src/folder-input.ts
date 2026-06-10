import { resolve } from 'node:path'
import { checkTargetDir } from './scaffolder.js'

export async function validateFolderInput(
  value: string,
): Promise<true | string> {
  const folder = value.trim()
  if (!folder) return 'Enter a folder path (relative or absolute).'
  return checkTargetDir(resolve(process.cwd(), folder))
}
