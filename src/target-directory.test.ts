import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearDirectoryExceptGit,
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
      status: 'ready',
      target: {
        requested: './slides',
        targetDir: join(process.cwd(), 'slides'),
      },
    })
  })

  it('keeps an absolute path as the target dir', async () => {
    const absolute = join(root, 'not-yet')

    expect(await resolveTargetDirectory(absolute)).toEqual({
      status: 'ready',
      target: { requested: absolute, targetDir: absolute },
    })
  })

  it('accepts a surrounding-whitespace path by trimming it', async () => {
    const absolute = join(root, 'not-yet')

    const result = await resolveTargetDirectory(`  ${absolute}  `)

    expect(result).toEqual({
      status: 'ready',
      target: { requested: absolute, targetDir: absolute },
    })
  })

  it('treats a pre-existing empty directory as ready', async () => {
    const empty = join(root, 'empty')
    await mkdir(empty, { recursive: true })

    expect(await resolveTargetDirectory(empty)).toEqual({
      status: 'ready',
      target: { requested: empty, targetDir: empty },
    })
  })

  it('rejects an empty input with guidance', async () => {
    const result = await resolveTargetDirectory('   ')

    expect(result).toEqual({
      status: 'invalid',
      error: expect.stringMatching(/relative or absolute/i),
    })
  })

  it('flags a non-empty directory for a decision, carrying the target', async () => {
    const occupied = join(root, 'occupied')
    await mkdir(occupied, { recursive: true })
    await writeFile(join(occupied, 'keep.txt'), 'precious')

    expect(await resolveTargetDirectory(occupied)).toEqual({
      status: 'not-empty',
      target: { requested: occupied, targetDir: occupied },
    })
  })
})

describe('clearDirectoryExceptGit', () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'slidash-clear-'))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('removes files and nested directories', async () => {
    await writeFile(join(dir, 'a.txt'), 'a')
    await mkdir(join(dir, 'nested'))
    await writeFile(join(dir, 'nested', 'b.txt'), 'b')

    await clearDirectoryExceptGit(dir)

    expect(await readdir(dir)).toEqual([])
  })

  it('preserves the .git directory', async () => {
    await mkdir(join(dir, '.git'))
    await writeFile(join(dir, '.git', 'HEAD'), 'ref: refs/heads/main')
    await writeFile(join(dir, 'stale.txt'), 'stale')

    await clearDirectoryExceptGit(dir)

    expect(await readdir(dir)).toEqual(['.git'])
    expect(await readdir(join(dir, '.git'))).toEqual(['HEAD'])
  })

  it('preserves a .git file (worktrees and submodules)', async () => {
    await writeFile(join(dir, '.git'), 'gitdir: /elsewhere/.git/worktrees/x')
    await writeFile(join(dir, 'stale.txt'), 'stale')

    await clearDirectoryExceptGit(dir)

    expect(await readdir(dir)).toEqual(['.git'])
  })
})
