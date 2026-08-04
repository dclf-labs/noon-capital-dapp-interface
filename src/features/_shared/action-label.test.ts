import { describe, expect, it } from 'vitest'

import { formatActionTokenLabel } from '@/features/_shared/action-label'

describe('formatActionTokenLabel', () => {
  it('joins action and symbol', () => {
    expect(formatActionTokenLabel('Buy', 'USN')).toBe('Buy USN')
    expect(formatActionTokenLabel('Bridge', 'sUSN')).toBe('Bridge sUSN')
  })

  it('falls back to the action when symbol is missing', () => {
    expect(formatActionTokenLabel('Mint')).toBe('Mint')
    expect(formatActionTokenLabel('Redeem', '  ')).toBe('Redeem')
  })
})
