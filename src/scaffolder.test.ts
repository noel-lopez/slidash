import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { scaffold } from './scaffolder.js'
import type { TargetDirectory } from './target-directory.js'

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
})
