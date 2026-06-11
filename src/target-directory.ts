import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

export interface TargetDirectory {
  requested: string
  targetDir: string
}

export type ResolveResult =
  | { ok: true; target: TargetDirectory }
  | { ok: false; error: string }

const EMPTY_INPUT = 'Enter a directory path (relative or absolute).'

export function validateTargetDirectoryInput(value: string): true | string {
  return value.trim() ? true : EMPTY_INPUT
}

export async function resolveTargetDirectory(
  value: string,
): Promise<ResolveResult> {
  const requested = value.trim()
  if (!requested) return { ok: false, error: EMPTY_INPUT }

  const targetDir = resolve(process.cwd(), requested)

  const existing = await readDirectory(targetDir)
  if (existing.length > 0) {
    return {
      ok: false,
      error: `Target directory is not empty: ${targetDir}. Refusing to overwrite existing files.`,
    }
  }

  return { ok: true, target: { requested, targetDir } }
}

async function readDirectory(dir: string): Promise<string[]> {
  try {
    return await readdir(dir)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}
