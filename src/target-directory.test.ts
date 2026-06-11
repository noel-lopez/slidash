import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  resolveTargetDirectory,
  validateTargetDirectoryInput,
} from './target-directory.js'

describe('validateTargetDirectoryInput', () => {
  it('rejects an empty input with guidance', () => {
    expect(validateTargetDirectoryInput('')).toMatch(/relative or absolute/i)
  })

  it('rejects a whitespace-only input with guidance', () => {
    expect(validateTargetDirectoryInput('   ')).toMatch(/relative or absolute/i)
  })

  it('accepts any non-empty input without touching the disk', () => {
    expect(validateTargetDirectoryInput('./slides')).toBe(true)
  })

  it('accepts a non-empty input even when that directory is occupied', async () => {
    const occupied = await mkdtemp(join(tmpdir(), 'slidash-input-'))
    await writeFile(join(occupied, 'keep.txt'), 'precious')

    expect(validateTargetDirectoryInput(occupied)).toBe(true)

    await rm(occupied, { recursive: true, force: true })
  })
})

describe('resolveTargetDirectory', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'slidash-input-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('trims and resolves a relative path against the cwd', async () => {
    const result = await resolveTargetDirectory('  ./slides  ')

    expect(result).toEqual({
      ok: true,
      target: {
        requested: './slides',
        targetDir: join(process.cwd(), 'slides'),
      },
    })
  })

  it('keeps an absolute path as the target dir', async () => {
    const absolute = join(root, 'not-yet')

    expect(await resolveTargetDirectory(absolute)).toEqual({
      ok: true,
      target: { requested: absolute, targetDir: absolute },
    })
  })

  it('accepts a surrounding-whitespace path by trimming it', async () => {
    const absolute = join(root, 'not-yet')

    const result = await resolveTargetDirectory(`  ${absolute}  `)

    expect(result).toEqual({
      ok: true,
      target: { requested: absolute, targetDir: absolute },
    })
  })

  it('accepts a pre-existing empty directory', async () => {
    const empty = join(root, 'empty')
    await mkdir(empty, { recursive: true })

    expect(await resolveTargetDirectory(empty)).toEqual({
      ok: true,
      target: { requested: empty, targetDir: empty },
    })
  })

  it('rejects an empty input with guidance', async () => {
    const result = await resolveTargetDirectory('   ')

    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/relative or absolute/i),
    })
  })

  it('rejects a non-empty directory with a clear message', async () => {
    const occupied = join(root, 'occupied')
    await mkdir(occupied, { recursive: true })
    await writeFile(join(occupied, 'keep.txt'), 'precious')

    const result = await resolveTargetDirectory(occupied)

    expect(result.ok).toBe(false)
    expect(result.ok === false && result.error).toMatch(/not empty/i)
  })
})
