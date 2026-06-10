import { fileURLToPath } from 'node:url'

export type StarterId = 'none'

export interface Starter {
  id: StarterId
  label: string
  templateDir: string
}

const starterDir = (id: StarterId): string =>
  fileURLToPath(new URL(`../templates/starters/${id}`, import.meta.url))

const STARTERS: Starter[] = [
  {
    id: 'none',
    label: 'No starter (blank canvas)',
    templateDir: starterDir('none'),
  },
]

export function listStarters(): Starter[] {
  return STARTERS
}

export function resolveStarter(id: string): Starter {
  const starter = STARTERS.find((s) => s.id === id)
  if (!starter) {
    const known = STARTERS.map((s) => s.id).join(', ')
    throw new Error(`Unknown starter "${id}". Available: ${known}.`)
  }
  return starter
}
