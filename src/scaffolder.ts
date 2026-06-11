import { cp, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolveStarter, type StarterId } from './starter-registry.js'
import type { TargetDirectory } from './target-directory.js'

export interface ScaffoldOptions {
  target: TargetDirectory
  starter: StarterId
}

const conveniencesDir = fileURLToPath(
  new URL('../templates/conveniences', import.meta.url),
)

export async function scaffold({
  target,
  starter,
}: ScaffoldOptions): Promise<void> {
  const source = resolveStarter(starter)
  const { targetDir } = target

  await mkdir(targetDir, { recursive: true })
  await cp(conveniencesDir, targetDir, { recursive: true })
  await cp(source.templateDir, targetDir, { recursive: true })
}
