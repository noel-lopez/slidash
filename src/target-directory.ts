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

  const existing = await readDirectory(targetDir)
  return existing.length > 0
    ? { status: 'not-empty', target }
    : { status: 'ready', target }
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

async function readDirectory(dir: string): Promise<string[]> {
  try {
    return await readdir(dir)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}
