import { describe, expect, it } from 'vitest'

import { secureRandomNonce } from '@/lib/secure-random'

describe('secureRandomNonce', () => {
  it('returns an integer in range', () => {
    for (let i = 0; i < 20; i++) {
      const n = secureRandomNonce(1000)
      expect(Number.isInteger(n)).toBe(true)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThan(1000)
    }
  })

  it('rejects invalid bounds', () => {
    expect(() => secureRandomNonce(1)).toThrow()
    expect(() => secureRandomNonce(0)).toThrow()
  })
})
