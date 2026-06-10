import { cp, mkdir, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolveStarter, type StarterId } from './starter-registry.js'

export interface ScaffoldOptions {
  targetDir: string
  starter: StarterId
}

const conveniencesDir = fileURLToPath(
  new URL('../templates/conveniences', import.meta.url),
)

export async function scaffold({
  targetDir,
  starter,
}: ScaffoldOptions): Promise<void> {
  const source = resolveStarter(starter)

  const check = await checkTargetDir(targetDir)
  if (check !== true) throw new Error(check)

  await mkdir(targetDir, { recursive: true })
  await cp(conveniencesDir, targetDir, { recursive: true })
  await cp(source.templateDir, targetDir, { recursive: true })
}

export async function checkTargetDir(dir: string): Promise<true | string> {
  let existing: string[]
  try {
    existing = await readdir(dir)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return true
    throw err
  }
  if (existing.length > 0) {
    return `Target folder is not empty: ${dir}. Refusing to overwrite existing files.`
  }
  return true
}
