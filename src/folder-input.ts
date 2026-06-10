import { resolve } from 'node:path'
import { checkTargetDir } from './scaffolder.js'

export function resolveFolderInput(value: string): {
  requested: string
  targetDir: string
} {
  const requested = value.trim()
  return { requested, targetDir: resolve(process.cwd(), requested) }
}

export async function validateFolderInput(
  value: string,
): Promise<true | string> {
  const { requested, targetDir } = resolveFolderInput(value)
  if (!requested) return 'Enter a folder path (relative or absolute).'
  return checkTargetDir(targetDir)
}
