import { describe, expect, it } from 'vitest'

import { slippageAdjustedAmount, toDeadline } from '@/features/swap/lib/amounts'

describe('swap amount helpers', () => {
  it('applies 1% slippage in basis-point math', () => {
    expect(slippageAdjustedAmount(1_000_000n, 1)).toBe(990_000n)
    expect(slippageAdjustedAmount(100n, 1)).toBe(99n)
    // Typical 18-decimal USN min-out haircut.
    expect(slippageAdjustedAmount(10_000000000000000000n, 1)).toBe(9_900000000000000000n)
  })

  it('defaults falsy slippage to 1%', () => {
    expect(slippageAdjustedAmount(1_000_000n, 0)).toBe(990_000n)
    expect(slippageAdjustedAmount(1_000_000n, 0)).toBe(slippageAdjustedAmount(1_000_000n, 1))
  })

  it('builds unix-second deadlines from ms offsets', () => {
    const before = Math.floor(Date.now() / 1000)
    const deadline = toDeadline(5 * 60 * 1000)
    const after = Math.floor(Date.now() / 1000)
    expect(deadline).toBeGreaterThanOrEqual(before + 5 * 60)
    expect(deadline).toBeLessThanOrEqual(after + 5 * 60)
    expect(deadline).toBeLessThan(1e11)
  })
})
