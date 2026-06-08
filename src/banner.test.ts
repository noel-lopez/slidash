import { describe, expect, it } from 'vitest'
import { banner } from './banner.js'

describe('banner', () => {
  it('shows the given version', () => {
    expect(banner('1.2.3')).toContain('v1.2.3')
  })

  it('names the project', () => {
    expect(banner('0.0.0')).toContain('Slidash')
  })
})
