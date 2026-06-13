import { readdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export interface TargetDirectory {
  requested: string
  targetDir: string
}

export type ResolveResult =
  | { status: 'ready'; target: TargetDirectory }
  | { status: 'not-empty'; target: TargetDirectory }
  | { status: 'invalid'; error: string }

const EMPTY_INPUT = 'Enter a directory path (relative or absolute).'

export function validateTargetDirectoryInput(value: string): true | string {
  return value.trim() ? true : EMPTY_INPUT
}

export async function resolveTargetDirectory(
  value: string,
): Promise<ResolveResult> {
  const requested = value.trim()
  if (!requested) return { status: 'invalid', error: EMPTY_INPUT }

  const targetDir = resolve(process.cwd(), requested)
  const target = { requested, targetDir }

  try {
    const existing = await readdir(targetDir)
    return existing.length > 0
      ? { status: 'not-empty', target }
      : { status: 'ready', target }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return { status: 'ready', target }
    if (code === 'ENOTDIR') {
      return {
        status: 'invalid',
        error: `${requested} exists but is a file, not a directory.`,
      }
    }
    if (code === 'EACCES' || code === 'EPERM') {
      return {
        status: 'invalid',
        error: `Cannot read ${requested}: permission denied.`,
      }
    }
    throw err
  }
}

export async function clearDirectoryExceptGit(
  targetDir: string,
): Promise<void> {
  const entries = await readdir(targetDir)
  await Promise.all(
    entries
      .filter((entry) => entry !== '.git')
      .map((entry) =>
        rm(join(targetDir, entry), { recursive: true, force: true }),
      ),
  )
}
