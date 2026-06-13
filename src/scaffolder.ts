import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
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

  let createdRoot: string | undefined
  let preexisting: Set<string> | undefined

  try {
    createdRoot = await mkdir(targetDir, { recursive: true })
    preexisting = createdRoot ? undefined : new Set(await readdir(targetDir))

    await cp(conveniencesDir, targetDir, { recursive: true })
    await cp(source.templateDir, targetDir, { recursive: true })
  } catch (err) {
    await rollback(targetDir, createdRoot, preexisting)
    throw describeWriteFailure(err, targetDir)
  }
}

async function rollback(
  targetDir: string,
  createdRoot: string | undefined,
  preexisting: Set<string> | undefined,
): Promise<void> {
  if (createdRoot) {
    await rm(createdRoot, { recursive: true, force: true }).catch(() => {})
    return
  }
  if (!preexisting) return

  const current = await readdir(targetDir).catch(() => [])
  await Promise.all(
    current
      .filter((entry) => !preexisting.has(entry))
      .map((entry) =>
        rm(join(targetDir, entry), { recursive: true, force: true }).catch(
          () => {},
        ),
      ),
  )
}

function describeWriteFailure(err: unknown, targetDir: string): Error {
  const code = (err as NodeJS.ErrnoException).code
  if (code === 'EACCES' || code === 'EPERM') {
    return new Error(`Cannot write to ${targetDir}: permission denied.`)
  }
  return err instanceof Error ? err : new Error(String(err))
}
