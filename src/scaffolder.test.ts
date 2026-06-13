import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { scaffold } from './scaffolder.js'
import type { TargetDirectory } from './target-directory.js'

vi.mock('node:fs/promises', { spy: true })

const notRoot = process.getuid === undefined || process.getuid() !== 0

function target(targetDir: string): TargetDirectory {
  return { requested: targetDir, targetDir }
}

describe('scaffold', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'slidash-test-'))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  describe('the "none" starter', () => {
    it('emits the conveniences plus the starter visual layer', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'none' })

      const files = await readdir(targetDir)
      expect(files.sort()).toEqual(
        [
          'AGENTS.md',
          'CLAUDE.md',
          'index.html',
          'notes.html',
          'notes.js',
          'slidash.css',
          'slidash.js',
          'theme.css',
          'tools',
        ].sort(),
      )
    })

    it('vendors the snap tool with its own isolated package.json, uninstalled', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'none' })

      const tools = await readdir(join(targetDir, 'tools'))
      expect(tools.sort()).toEqual(['package.json', 'snap.mjs'])
      expect(tools).not.toContain('node_modules')

      const pkg = JSON.parse(
        await readFile(join(targetDir, 'tools', 'package.json'), 'utf8'),
      )
      expect(pkg.dependencies).toHaveProperty('playwright')
    })

    it('ships a neutral theme.css stub, not an opinionated aesthetic', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'none' })

      const theme = await readFile(join(targetDir, 'theme.css'), 'utf8')
      expect(theme).toMatch(/:root/)
    })

    it('does not install dependencies (no node_modules)', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'none' })

      const files = await readdir(targetDir)
      expect(files).not.toContain('node_modules')
    })

    it('wires index.html to the machinery so the deck is navigable', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'none' })

      const html = await readFile(join(targetDir, 'index.html'), 'utf8')
      expect(html).toContain('theme.css')
      expect(html).toContain('slidash.css')
      expect(html).toContain('slidash.js')
    })
  })

  describe('the "indigo-ink" starter', () => {
    it('emits the conveniences plus the Indigo Ink visual layer', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'indigo-ink' })

      const files = await readdir(targetDir)
      expect(files.sort()).toEqual(
        [
          'AGENTS.md',
          'CLAUDE.md',
          'index.html',
          'notes.html',
          'notes.js',
          'slidash.css',
          'slidash.js',
          'theme.css',
          'tools',
        ].sort(),
      )
    })

    it('ships a token-first theme that tints the chrome through the machinery hooks', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'indigo-ink' })

      const theme = await readFile(join(targetDir, 'theme.css'), 'utf8')
      expect(theme).toMatch(/--accent:\s*#4f46e5/i)
      expect(theme).toMatch(/--slidash-chrome-accent:\s*var\(--accent\)/)
    })

    it('opens cleanly over file:// — fonts degrade to a system fallback', async () => {
      const targetDir = join(root, 'deck')

      await scaffold({ target: target(targetDir), starter: 'indigo-ink' })

      const theme = await readFile(join(targetDir, 'theme.css'), 'utf8')
      expect(theme).toMatch(/--font-display:[^;]*system-ui/i)
      expect(theme).toMatch(/--font-body:[^;]*system-ui/i)
    })
  })

  it('scaffolds into a pre-existing empty directory', async () => {
    const targetDir = join(root, 'empty')
    await mkdir(targetDir, { recursive: true })

    await scaffold({ target: target(targetDir), starter: 'none' })

    expect(await readdir(targetDir)).toContain('index.html')
  })

  it('trusts the validated target and merges into a non-empty directory without refusing', async () => {
    const targetDir = join(root, 'occupied')
    await mkdir(targetDir, { recursive: true })
    await writeFile(join(targetDir, 'keep.txt'), 'precious')

    await scaffold({ target: target(targetDir), starter: 'none' })

    const files = await readdir(targetDir)
    expect(files).toContain('keep.txt')
    expect(files).toContain('index.html')
    expect(await readFile(join(targetDir, 'keep.txt'), 'utf8')).toBe('precious')
  })

  describe('atomic cleanup when a copy fails partway', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('removes the directory it created, restoring the previous state', async () => {
      const targetDir = join(root, 'fresh')
      vi.mocked(cp).mockRejectedValueOnce(new Error('disk full'))

      await expect(
        scaffold({ target: target(targetDir), starter: 'none' }),
      ).rejects.toThrow()

      await expect(stat(targetDir)).rejects.toMatchObject({ code: 'ENOENT' })
    })

    it('leaves a pre-existing empty directory empty, with no partial files', async () => {
      const targetDir = join(root, 'empty')
      await mkdir(targetDir, { recursive: true })

      const realCp = (
        (await vi.importActual(
          'node:fs/promises',
        )) as typeof import('node:fs/promises')
      ).cp
      let calls = 0
      vi.mocked(cp).mockImplementation((...args) => {
        calls += 1
        if (calls === 2) return Promise.reject(new Error('disk full mid-copy'))
        return realCp(...args)
      })

      await expect(
        scaffold({ target: target(targetDir), starter: 'none' }),
      ).rejects.toThrow()

      expect(await readdir(targetDir)).toEqual([])
    })

    it('surfaces the write failure even when cleanup cannot complete', async () => {
      const targetDir = join(root, 'fresh')
      vi.mocked(cp).mockRejectedValueOnce(new Error('disk full'))
      vi.mocked(rm).mockRejectedValueOnce(new Error('cleanup blew up'))

      await expect(
        scaffold({ target: target(targetDir), starter: 'none' }),
      ).rejects.toThrow(/disk full/)
    })

    it('keeps pre-existing files when merging fails partway', async () => {
      const targetDir = join(root, 'occupied')
      await mkdir(targetDir, { recursive: true })
      await writeFile(join(targetDir, 'keep.txt'), 'precious')

      const realCp = (
        (await vi.importActual(
          'node:fs/promises',
        )) as typeof import('node:fs/promises')
      ).cp
      let calls = 0
      vi.mocked(cp).mockImplementation((...args) => {
        calls += 1
        if (calls === 2) return Promise.reject(new Error('disk full mid-copy'))
        return realCp(...args)
      })

      await expect(
        scaffold({ target: target(targetDir), starter: 'none' }),
      ).rejects.toThrow()

      expect(await readdir(targetDir)).toEqual(['keep.txt'])
      expect(await readFile(join(targetDir, 'keep.txt'), 'utf8')).toBe(
        'precious',
      )
    })
  })

  it.skipIf(!notRoot)(
    'fails with a clear message, not a raw stack trace, when the target is not writable',
    async () => {
      const targetDir = join(root, 'locked')
      await mkdir(targetDir, { recursive: true })
      await chmod(targetDir, 0o555)

      await expect(
        scaffold({ target: target(targetDir), starter: 'none' }),
      ).rejects.toThrow(/permission denied/i)

      await chmod(targetDir, 0o755)
    },
  )
})
