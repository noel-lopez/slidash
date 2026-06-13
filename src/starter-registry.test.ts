import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { listStarters, resolveStarter } from './starter-registry.js'

describe('starter registry', () => {
  it('lists the available starters', () => {
    const ids = listStarters().map((s) => s.id)
    expect(ids).toContain('none')
    expect(ids).toContain('indigo-ink')
  })

  it('offers Indigo Ink before the from-scratch option', () => {
    const ids = listStarters().map((s) => s.id)
    expect(ids.indexOf('indigo-ink')).toBeLessThan(ids.indexOf('none'))
  })

  it('carries the reviewed selection copy for each starter', () => {
    const find = (id: string) => {
      const starter = listStarters().find((s) => s.id === id)
      if (!starter) throw new Error(`missing starter ${id}`)
      return starter
    }
    expect(find('indigo-ink').label).toBe('Indigo Ink')
    expect(find('indigo-ink').description).toMatch(/indigo accent/i)
    expect(find('none').label).toBe('Start from scratch')
    expect(find('none').description).toMatch(/blank but fully working/i)
  })

  it('resolves a known id to its template source', () => {
    const starter = resolveStarter('none')
    expect(starter.id).toBe('none')
    expect(existsSync(starter.templateDir)).toBe(true)
  })

  it('resolves the indigo-ink id to its template source', () => {
    const starter = resolveStarter('indigo-ink')
    expect(starter.id).toBe('indigo-ink')
    expect(existsSync(starter.templateDir)).toBe(true)
  })

  it('throws on an unknown id', () => {
    expect(() => resolveStarter('does-not-exist')).toThrow(/unknown starter/i)
  })
})
