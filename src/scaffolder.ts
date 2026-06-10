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

  await ensureEmptyDir(targetDir)

  await cp(conveniencesDir, targetDir, { recursive: true })
  await cp(source.templateDir, targetDir, { recursive: true })
}

async function ensureEmptyDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true })
  const existing = await readdir(dir)
  if (existing.length > 0) {
    throw new Error(
      `Target folder is not empty: ${dir}. Refusing to overwrite existing files.`,
    )
  }
}
