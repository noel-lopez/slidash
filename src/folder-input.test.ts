import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { validateFolderInput } from './folder-input.js'

describe('validateFolderInput', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'slidash-input-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('rejects an empty input with guidance', async () => {
    expect(await validateFolderInput('')).toMatch(/relative or absolute/i)
  })

  it('rejects a whitespace-only input with guidance', async () => {
    expect(await validateFolderInput('   ')).toMatch(/relative or absolute/i)
  })

  it('accepts an absolute path that does not exist yet', async () => {
    expect(await validateFolderInput(join(root, 'not-yet'))).toBe(true)
  })

  it('accepts a surrounding-whitespace path by trimming it', async () => {
    expect(await validateFolderInput(`  ${join(root, 'not-yet')}  `)).toBe(true)
  })

  it('rejects a non-empty folder with a clear message', async () => {
    const occupied = join(root, 'occupied')
    await mkdir(occupied, { recursive: true })
    await writeFile(join(occupied, 'keep.txt'), 'precious')

    expect(await validateFolderInput(occupied)).toMatch(/not empty/i)
  })
})
