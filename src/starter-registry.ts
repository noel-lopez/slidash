import { fileURLToPath } from 'node:url'

export type StarterId = 'indigo-ink' | 'none'

export interface Starter {
  id: StarterId
  label: string
  description: string
  templateDir: string
}

const starterDir = (id: StarterId): string =>
  fileURLToPath(new URL(`../templates/starters/${id}`, import.meta.url))

const STARTERS: Starter[] = [
  {
    id: 'indigo-ink',
    label: 'Indigo Ink',
    description:
      'Minimal editorial look. White canvas, near-black ink, one indigo accent.',
    templateDir: starterDir('indigo-ink'),
  },
  {
    id: 'none',
    label: 'Start from scratch',
    description:
      'Blank but fully working. Bring your own look with your agent.',
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
