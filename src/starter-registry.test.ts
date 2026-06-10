import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { listStarters, resolveStarter } from './starter-registry.js'

describe('starter registry', () => {
  it('lists the available starters', () => {
    const ids = listStarters().map((s) => s.id)
    expect(ids).toContain('none')
  })

  it('resolves a known id to its template source', () => {
    const starter = resolveStarter('none')
    expect(starter.id).toBe('none')
    expect(existsSync(starter.templateDir)).toBe(true)
  })

  it('throws on an unknown id', () => {
    expect(() => resolveStarter('does-not-exist')).toThrow(/unknown starter/i)
  })
})
